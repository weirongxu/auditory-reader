import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

type PositionSyncPost = {
  uuid: BookTypes.EntityUUID
  pos: BookTypes.PropertyPosition
}

export const booksPositionSyncRouter = new URouter<PositionSyncPost, any>(
  'books/position-sync',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.posSet(body.pos)
  return { ok: true }
})
