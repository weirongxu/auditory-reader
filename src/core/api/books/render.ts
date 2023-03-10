import mime from 'mime-types'
import path from 'path'
import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export const booksRenderRouter = new URouter('books/render', {
  method: 'get',
  isDynamic: true,
}).routeLogined(async ({ req, res, userInfo }) => {
  const [uuid, ...paths] = req.paths
  if (!uuid) throw new ErrorRequestResponse('uuid not found')
  const book = await bookManager.book(userInfo.account, uuid)
  const filepath = path.join(...paths)
  const file = await book.file(filepath)
  if (!file) throw new ErrorRequestResponse('Path in book not found')
  const contType = mime.contentType(path.basename(filepath))
  res.header('Content-Type', contType.toString())
  return file
})

export const getBooksRenderPath = (uuid: string, p: string) =>
  path.join(booksRenderRouter.fullRoutePath, uuid, p)
