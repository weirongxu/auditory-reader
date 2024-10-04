import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookPost = {
  filter: Partial<BookTypes.FilterParams>
}

export type BookList = {
  items: BookTypes.Entity[]
}

export const booksListRouter = new URouter<BookPost, BookList>(
  'books/list',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const { filter } = body
  const data = await bookManager.list(userInfo.account).list(filter)
  return {
    items: data,
  }
})
