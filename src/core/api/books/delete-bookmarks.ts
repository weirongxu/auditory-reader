import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

interface BookAddBookmark extends BookViewQuery {
  bookmarkUuids: string[]
}

export const booksDeleteBookmarksRouter = new URouter<BookAddBookmark, any>(
  'books/delete-bookmarks'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.bookmarksDelete(body.bookmarkUuids)
  return { ok: true }
})
