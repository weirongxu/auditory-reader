import { bookManager } from '../../book/book-manager.js'
import { uniqueQueue } from '../../job/job.js'
import { UpdatePageParagraphsJob } from '../../job/page-paragraphs.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

export type BookPageParagraphsRes = {
  pageParagraphCounts: number[] | null
}

export const booksPageParagraphsRouter = new URouter<
  BookViewQuery,
  BookPageParagraphsRes
>('books/page-paragraphs').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const book = await bookManager.book(userInfo.account, body.uuid)
  if (!bookEntity.entity.pageParagraphCounts && book.spines.length < 10000) {
    await uniqueQueue.run(
      `${body.uuid}-page-paragraphs`,
      new UpdatePageParagraphsJob(userInfo, body.uuid, book),
    )
  }
  return {
    pageParagraphCounts: (await bookManager.entity(userInfo.account, body.uuid))
      .entity.pageParagraphCounts,
  }
})
