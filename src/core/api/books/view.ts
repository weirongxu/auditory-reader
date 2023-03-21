import type { BookBase, BookNav, BookSpine } from '../../book/book-base.js'
import { bookManager } from '../../book/book-manager.js'
import type { BookEntityBase } from '../../book/entity/book-entity-base.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export type BookViewQuery = {
  uuid: BookTypes.EntityUUID
}

export type BookViewRes = {
  item: BookTypes.Entity
  navs: BookNav[]
  spines: BookSpine[]
}

export const booksViewRouter = new URouter<BookViewQuery, BookViewRes>(
  'books/view'
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  let bookEntity: BookEntityBase | undefined
  let book: BookBase | undefined
  if (body.uuid === '$tmp') {
    bookEntity = await bookManager.entityTmp(userInfo.account)
    if (!bookEntity) throw new ErrorRequestResponse('Tmp not found')
    book = await bookManager.bookTmp(userInfo.account)
    if (!book) throw new ErrorRequestResponse('Tmp not found')
  } else {
    bookEntity = await bookManager.entity(userInfo.account, body.uuid)
    book = await bookManager.book(userInfo.account, body.uuid)
    if (!book) throw new ErrorRequestResponse('Parse epub error')
  }
  return {
    item: bookEntity.entity,
    navs: await book.navs(),
    spines: book.spines,
  }
})
