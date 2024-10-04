import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookShowQuery = {
  uuid: string
}

export const booksShowRouter = new URouter<BookShowQuery, BookTypes.Entity>(
  'books/show',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  return bookEntity.entity
})
