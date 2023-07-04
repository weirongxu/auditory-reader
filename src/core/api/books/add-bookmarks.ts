import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

type AddBookmark = Omit<BookTypes.PropertyBookmark, 'uuid'>

interface BookAddBookmark extends BookViewQuery {
  bookmarks: AddBookmark[]
}

export const booksAddBookmarksRouter = new URouter<BookAddBookmark, any>(
  'books/add-bookmarks'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.bookmarksAdd(
    body.bookmarks.map((bm) => ({
      uuid: uuidv1(),
      ...bm,
    }))
  )
  return { ok: true }
})
