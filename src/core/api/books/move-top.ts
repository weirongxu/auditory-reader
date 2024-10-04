import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'

export type BookMoveTopItQuery = {
  uuid: string
}

export const booksMoveTopRouter = new URouter<
  BookMoveTopItQuery,
  { ok: boolean }
>('books/move-top').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const book = bookManager.list(userInfo.account)
  await book.moveTop(body.uuid)
  return { ok: true }
})
