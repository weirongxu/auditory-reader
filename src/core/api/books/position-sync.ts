import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

type PositionSyncPost = {
  uuid: BookTypes.EntityUUID
  pos: BookTypes.PropertyPosition
}

export const booksPositionSyncRouter = new URouter<
  PositionSyncPost,
  { ok: boolean }
>('books/position-sync').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  await bookManager.update(userInfo.account, body.uuid, {
    position: body.pos,
  })
  return { ok: true }
})
