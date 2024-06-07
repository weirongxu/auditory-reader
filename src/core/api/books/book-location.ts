import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'

export type BookLocationPost = {
  uuid: BookTypes.EntityUUID
  isArchived: boolean
}

export const booksLocationInPageRouter = new URouter<
  BookLocationPost,
  BookTypes.LocationInPageState | undefined
>('books/location-in-page').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  return bookManager
    .list(userInfo.account)
    .locationInPage(body.uuid, body.isArchived)
})
