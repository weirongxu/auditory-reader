import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

export const booksPositionRouter = new URouter<
  BookViewQuery,
  BookTypes.PropertyPosition
>('books/position').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  return (
    bookEntity.entity.position ??
    (await bookEntity.posGet()) ?? {
      section: 0,
      paragraph: 0,
    }
  )
})
