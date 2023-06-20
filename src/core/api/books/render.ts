import mime from 'mime-types'
import path from 'path'
import type { BookBase } from '../../book/book-base.js'
import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export const booksRenderRouter = new URouter('books/render', {
  method: 'get',
  isDynamic: true,
}).routeLogined(async ({ req, res, userInfo }) => {
  const [type, uuid, ...paths] = req.paths
  if (!type || !uuid) throw new ErrorRequestResponse('uuid not found')
  let book: BookBase | undefined
  if (type === 'tmp') {
    book = await bookManager.bookTmp(userInfo.account)
  } else {
    book = await bookManager.book(userInfo.account, uuid)
  }
  if (!book) throw new ErrorRequestResponse('book not found')
  const filepath = path.join(...paths)
  const file = await book.file(filepath)
  if (!file) throw new ErrorRequestResponse('Path in book not found')
  const contType = file.mediaType ?? mime.contentType(path.basename(filepath))
  if (contType) res.header('Content-Type', contType)
  return file.buffer
})

export const getBooksRenderPath = (
  type: 'book' | 'tmp',
  uuid: string,
  p: string
) => path.join(booksRenderRouter.fullRoutePath, type, uuid, p)
