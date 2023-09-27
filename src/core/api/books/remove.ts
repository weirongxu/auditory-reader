import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'

export type BookRemoveQuery = {
  uuid: string
}

export const booksRemoveRouter = new URouter<BookRemoveQuery>(
  'books/remove',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  await bookManager.delete(userInfo.account, body.uuid)
  return { ok: true }
})
