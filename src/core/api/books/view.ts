import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { uniqueQueue } from '../../job/job.js'
import { UpdatePageParagraphsJob } from '../../job/page-paragraphs.js'
import { URouter } from '../../route/router.js'
import { bookEntityRawToEntityRender } from '../../util/book.js'

export type BookViewQuery = {
  uuid: BookTypes.EntityUUID
}

export type BookViewRes = {
  item: BookTypes.Entity
  navs: BookTypes.Nav[]
  spines: BookTypes.Spine[]
}

export const booksViewRouter = new URouter<BookViewQuery, BookViewRes>(
  'books/view',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const book = await bookManager.book(userInfo.account, body.uuid)

  // parse pageParagraphs
  if (!bookEntity.entity.pageParagraphs && book.spines.length < 10000) {
    uniqueQueue.run(
      `pageParagraphs-${body.uuid}`,
      new UpdatePageParagraphsJob(userInfo, body.uuid, book),
    )
  }

  return {
    item: bookEntityRawToEntityRender(bookEntity.entity, {
      withPageParagraphs: true,
    }),
    navs: await book.navs(),
    spines: book.spines,
  }
})
