import { bookManager } from '../../book/book-manager.js'
import type { BookEntityBase } from '../../book/entity/book-entity-base.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

export const booksBookmarksRouter = new URouter<
  BookViewQuery,
  BookTypes.PropertyBookmark[]
>('books/bookmarks').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity: BookEntityBase | undefined =
    body.uuid === '$tmp'
      ? await bookManager.entityTmp(userInfo.account)
      : await bookManager.entity(userInfo.account, body.uuid)
  if (!bookEntity) {
    return []
  }
  return await bookEntity.bookmarksGet()
})
