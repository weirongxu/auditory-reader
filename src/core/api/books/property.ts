import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

export const booksPropertyRouter = new URouter<
  BookViewQuery,
  BookTypes.PropertyJson
>('books/property').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  return bookEntity.readProp()
})
