import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

type SyncPositionPost = {
  uuid: BookTypes.EntityUUID
  pos: BookTypes.PropertyPosition
}

export const booksSyncPositionRouter = new URouter<SyncPositionPost, any>(
  'books/sync-position',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity?.posSet(body.pos)
  return { ok: true }
})
