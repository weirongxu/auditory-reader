import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export type BookTopItQuery = {
  uuid: string
}

export const booksMoveTopRouter = new URouter<BookTopItQuery>(
  'books/move-top'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const book = bookManager.list(userInfo.account)
  if (!book) throw new ErrorRequestResponse('Parse epub error')
  await book.moveTop(body.uuid)
  return { ok: true }
})
