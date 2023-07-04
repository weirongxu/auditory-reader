import type { BookNav, BookSpine } from '../../book/book-base.js'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookViewQuery = {
  uuid: BookTypes.EntityUUID
}

export type BookViewRes = {
  item: BookTypes.Entity
  navs: BookNav[]
  spines: BookSpine[]
}

export const booksViewRouter = new URouter<BookViewQuery, BookViewRes>(
  'books/view'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const book = await bookManager.book(userInfo.account, body.uuid)
  return {
    item: bookEntity.entity,
    navs: await book.navs(),
    spines: book.spines,
  }
})
