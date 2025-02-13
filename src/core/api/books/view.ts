import mime from 'mime-types'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import { arrayBufferToString } from '../../util/converter.js'
import path from 'path'
import { jsDOMParser } from '../../util/dom.js'
import { ReadableExtractor } from '../../util/readable.js'
import type { BookEpub } from '../../book/book-epub.js'
import { bookEntityRawToEntityRender } from '../../util/book.js'

export type BookViewQuery = {
  uuid: BookTypes.EntityUUID
}

export type BookViewRes = {
  item: BookTypes.Entity
  navs: BookTypes.Nav[]
  spines: BookTypes.Spine[]
}

async function getPageParagraphs(book: BookEpub) {
  const pageParagraphs: BookTypes.PageParagraph[] = []
  for (const spine of book.spines) {
    const filepath = spine.href
    const file = await book.file(filepath)
    if (!file) {
      pageParagraphs.push({ paragraphCount: 0 })
      continue
    }
    const content = arrayBufferToString(file.buffer)
    const contType = file.mediaType ?? mime.contentType(path.basename(filepath))
    if (
      contType &&
      ['/xml', '/html', '/xhtml'].some((t) => contType.includes(t))
    ) {
      const { doc } = jsDOMParser(content)
      const readableExtractor = new ReadableExtractor(doc, [])
      const parts = readableExtractor.toReadableParts()
      pageParagraphs.push({
        paragraphCount: parts.length,
      })
    } else {
      pageParagraphs.push({
        paragraphCount: 0,
      })
    }
  }
  return pageParagraphs
}

export const booksViewRouter = new URouter<BookViewQuery, BookViewRes>(
  'books/view',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const book = await bookManager.book(userInfo.account, body.uuid)

  // parse pageParagraphs
  if (!bookEntity.entity.pageParagraphs && book.spines.length < 10000) {
    await bookManager.update(userInfo.account, body.uuid, {
      pageParagraphs: await getPageParagraphs(book),
    })
  }

  return {
    item: bookEntityRawToEntityRender(bookEntity.entity),
    navs: await book.navs(),
    spines: book.spines,
  }
})
