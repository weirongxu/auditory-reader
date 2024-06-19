import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookPost = {
  filter: Partial<BookTypes.FilterParams>
  page: {
    page?: number
    perPage?: number
  }
}

export type BookPage = {
  items: BookTypes.Entity[]
  current: number
  count: number
  pageCount: number
}

export const booksPageRouter = new URouter<BookPost, BookPage>(
  'books/page',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const { page, filter } = body
  const data = await bookManager.list(userInfo.account).page(filter, page)
  return {
    items: data.items,
    current: data.page,
    pageCount: data.pageCount,
    count: data.count,
  }
})
