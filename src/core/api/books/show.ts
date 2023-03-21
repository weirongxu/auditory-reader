import { bookManager } from '../../book/book-manager.js'
import type { BookEntityBase } from '../../book/entity/book-entity-base.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export type BookShowQuery = {
  uuid: string
}

export const booksShowRouter = new URouter<
  BookShowQuery,
  BookTypes.Entity | undefined
>('books/show').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity: BookEntityBase = await bookManager.entity(
    userInfo.account,
    body.uuid
  )
  if (!bookEntity) throw new ErrorRequestResponse('book item not found')
  return bookEntity.entity
})
