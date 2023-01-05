import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookPost = {
  page?: number
}

export type BookPage = {
  items: BookTypes.Entity[]
  current: number
  count: number
  pageCount: number
}

export const booksPageRouter = new URouter<BookPost, BookPage>(
  'books/page'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const page = body.page ?? 1
  const data = await bookManager.list(userInfo.account).page({ page })
  return {
    items: data.items,
    current: data.page,
    pageCount: data.pageCount,
    count: data.count,
  }
})
