import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'

export type BookMoveOffsetItQuery = {
  uuid: string
  afterUuid: string
}

export const booksMoveAfterRouter = new URouter<BookMoveOffsetItQuery>(
  'books/move-after',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const book = bookManager.list(userInfo.account)
  await book.moveAfter(body.uuid, body.afterUuid)
  return { ok: true }
})
