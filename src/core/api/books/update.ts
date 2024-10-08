import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookUpdateQuery = {
  uuid: string
  update: BookTypes.EntityUpdate
}

export const booksUpdateRouter = new URouter<BookUpdateQuery, { ok: boolean }>(
  'books/update',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  await bookManager.update(userInfo.account, body.uuid, body.update)
  return { ok: true }
})
