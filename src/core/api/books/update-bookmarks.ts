import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

interface BookUpdateBookmark extends BookViewQuery {
  bookmarks: BookTypes.PropertyBookmark[]
}

export const booksUpdateBookmarksRouter = new URouter<BookUpdateBookmark, any>(
  'books/update-bookmarks',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.bookmarksUpdate(body.bookmarks)
  return { ok: true }
})
