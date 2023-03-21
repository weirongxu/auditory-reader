import { bookManager } from '../../book/book-manager.js'
import type { BookEntityBase } from '../../book/entity/book-entity-base.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

export const booksPositionRouter = new URouter<
  BookViewQuery,
  BookTypes.PropertyPosition
>('books/position').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity: BookEntityBase | undefined =
    body.uuid === '$tmp'
      ? await bookManager.entityTmp(userInfo.account)
      : await bookManager.entity(userInfo.account, body.uuid)
  if (!bookEntity) {
    return {
      section: 0,
      paragraph: 0,
    }
  }
  return await bookEntity.posGet()
})
