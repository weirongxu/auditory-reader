import type { BookBase } from '../../book/book-base.js'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export type BookCoverQuery = {
  uuid: BookTypes.EntityUUID
}

export const booksCoverRouter = new URouter<BookCoverQuery>('books/cover', {
  method: 'get',
}).routeLogined(async ({ req, res, userInfo }) => {
  const uuid = req.searchParams.get('uuid')
  let book: BookBase | undefined
  if (uuid === '$tmp') {
    book = await bookManager.bookTmp(userInfo.account)
    if (!book) throw new ErrorRequestResponse('Tmp not found')
  } else if (uuid) {
    book = await bookManager.book(userInfo.account, uuid)
    if (!book) throw new ErrorRequestResponse('Parse epub error')
  } else {
    throw new ErrorRequestResponse('uuid parameter required')
  }

  const file = await book.cover()
  if (!file) throw new ErrorRequestResponse('cover in book not found')

  if (file.mediaType) res.header('Content-Type', file.mediaType.toString())
  return file.buffer
})

export const getBooksCoverPath = (uuid: string) =>
  `${booksCoverRouter.fullRoutePath}?uuid=${uuid}`
