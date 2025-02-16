import saveAs from 'file-saver'
import JSZip from 'jszip'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksImportRouter } from '../../../core/api/books/import.js'
import { booksPropertyRouter } from '../../../core/api/books/property.js'
import type { BookTypes } from '../../../core/book/types.js'
import { getBookExtension } from '../../../core/util/book.js'
import { arrayBufferToBase64 } from '../../../core/util/converter.js'
import { notificationApi } from '../../common/notification.js'

const toPercent = (f: number) => Math.floor(f * 100)

export type BookExportItem = {
  uuid: string
  name: string
  folder: string
}

const bookFilename = (entity: BookExportItem | BookTypes.EntityJson) =>
  `${entity.name}${getBookExtension()}`

export const exportBooks = async (
  books: BookTypes.EntityRaw[],
  onProgress: (percent: number) => void,
) => {
  const zip = new JSZip()
  const count = books.length
  const list: BookExportItem[] = books.map((book) => ({
    uuid: book.uuid,
    name: book.name,
    folder: `${book.name}-(${book.uuid})`,
  }))
  zip.file('list.json', JSON.stringify({ list }, null, 2))
  for (const [i, book] of list.entries()) {
    const bookEpub = await booksDownloadRouter.file({
      uuid: book.uuid,
    })
    const propertiesJson = await booksPropertyRouter.json({
      uuid: book.uuid,
    })
    const bookJson = { ...book }
    const filename = bookFilename(book)
    const dir = book.folder
    zip.file(`${dir}/property.json`, JSON.stringify(propertiesJson, null, 2))
    zip.file(`${dir}/book.json`, JSON.stringify(bookJson, null, 2))
    zip.file(`${dir}/${filename}`, bookEpub.arrayBuffer())
    onProgress(toPercent((i + 1) / count))
  }
  saveAs(await zip.generateAsync({ type: 'blob' }), 'books.zip')
}

export const importBooksList = async (
  zip: JSZip,
): Promise<BookExportItem[]> => {
  const listFile = zip.file('list.json')
  if (listFile) {
    const jsonStr = await listFile.async('text')
    const json: { list: BookExportItem[] } = JSON.parse(jsonStr)
    return json.list
  }
  notificationApi().warning({
    message: 'Warning',
    description: 'Cannot find list.json in zip',
  })
  const files = Object.keys(zip.files)
  const folders = files
    .filter((name) => name.endsWith('/'))
    .map((name) => name.slice(0, -1))
  return folders
    .map((folder) => {
      const match = folder.match(/^(.*?)-\((.*?)\)$/)
      const name = match ? match[1] : null
      const uuid = match ? match[2] : null
      if (!name || !uuid) return null
      return {
        folder,
        name,
        uuid,
      }
    })
    .filter((it) => it !== null)
}

export const importBooks = async (
  zip: JSZip,
  list: BookExportItem[],
  onProgress: (percent: number) => void,
) => {
  const count = list.length
  for (const [i, item] of list.entries()) {
    const bookJson = await zip.file(`${item.folder}/book.json`)?.async('text')
    if (!bookJson) continue
    const book = JSON.parse(bookJson) as BookTypes.EntityJson
    const filename = bookFilename(book)
    const bookEpub = await zip
      .file(`${item.folder}/${filename}`)
      ?.async('arraybuffer')
    if (!bookEpub) continue
    const propertiesJson = await zip
      .file(`${item.folder}/property.json`)
      ?.async('text')
    const property = propertiesJson
      ? (JSON.parse(propertiesJson) as BookTypes.PropertyJson)
      : null
    await booksImportRouter.json({
      entity: book,
      property,
      bufferBase64: arrayBufferToBase64(bookEpub),
    })
    onProgress(toPercent((i + 1) / count))
  }
}
