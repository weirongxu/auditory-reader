import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export type BookMoveOffsetItQuery = {
  uuid: string
  offset: number
}

export const booksMoveOffsetRouter = new URouter<BookMoveOffsetItQuery>(
  'books/move-offset'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const book = bookManager.list(userInfo.account)
  if (!book) throw new ErrorRequestResponse('Parse epub error')
  await book.moveOffset(body.uuid, body.offset)
  return { ok: true }
})
