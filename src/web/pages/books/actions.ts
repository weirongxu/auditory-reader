import path from '@file-services/path'
import saveAs from 'file-saver'
import JSZip from 'jszip'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksPropertyRouter } from '../../../core/api/books/property.js'
import type { BookTypes } from '../../../core/book/types.js'
import { getBookExtension } from '../../../core/util/book.js'
import { booksImportRouter } from '../../../core/api/books/import.js'
import { arrayBufferToBase64 } from '../../../core/util/converter.js'

const toPercent = (f: number) => Math.floor(f * 100)

const bookFilename = (entity: BookTypes.Entity | BookTypes.EntityJson) =>
  `${entity.name}${getBookExtension(entity)}`

export const exportBooks = async (
  books: BookTypes.Entity[],
  onProgress: (percent: number) => void,
) => {
  const zip = new JSZip()
  const count = books.length
  for (const [i, book] of books.entries()) {
    const bookEpub = await booksDownloadRouter.file({
      uuid: book.uuid,
    })
    const propertiesJson = await booksPropertyRouter.json({
      uuid: book.uuid,
    })
    const bookJson = { ...book }
    const bookName = bookJson.name
    const filename = bookFilename(book)
    const dir = `${bookName}-(${bookJson.uuid})`
    zip.file(`${dir}/property.json`, JSON.stringify(propertiesJson, null, 2))
    zip.file(`${dir}/book.json`, JSON.stringify(bookJson, null, 2))
    zip.file(`${dir}/${filename}`, bookEpub.arrayBuffer())
    onProgress(toPercent((i + 1) / count))
  }
  saveAs(await zip.generateAsync({ type: 'blob' }), 'books.zip')
}

export type ImportBookItem = {
  folder: string
  basename: string
}

export const importBooksList = (zip: JSZip): ImportBookItem[] => {
  const files = Object.keys(zip.files)
  const folders = files
    .filter((name) => name.endsWith('/'))
    .map((name) => name.slice(0, -1))
  return folders.map((folder) => ({
    folder,
    basename: path.basename(folder),
  }))
}

export const importBooks = async (
  zip: JSZip,
  list: ImportBookItem[],
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
