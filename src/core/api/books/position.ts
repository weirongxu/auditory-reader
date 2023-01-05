import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export const booksPositionRouter = new URouter<any, BookTypes.PropertyPosition>(
  'books/position'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  if (!bookEntity) {
    return {
      section: 0,
      paragraph: 0,
    }
  }
  return await bookEntity.posGet()
})
