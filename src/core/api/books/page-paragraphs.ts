import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { UpdatePageParagraphsJob } from '../../job/page-paragraphs.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

export type BookPageParagraphsRes = {
  pageParagraphs: BookTypes.PageParagraph[] | null
}

export const booksPageParagraphsRouter = new URouter<
  BookViewQuery,
  BookPageParagraphsRes
>('books/page-paragraphs').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const book = await bookManager.book(userInfo.account, body.uuid)
  if (!bookEntity.entity.pageParagraphs && book.spines.length < 10000) {
    await new UpdatePageParagraphsJob(userInfo, body.uuid, book).start()
  }
  return {
    pageParagraphs: (await bookManager.entity(userInfo.account, body.uuid))
      .entity.pageParagraphs,
  }
})
