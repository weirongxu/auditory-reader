import { bookManager } from '../../book/book-manager.js'
import type { BookEntityBase } from '../../book/entity/book-entity-base.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

export type BookDownloadQuery = {
  uuid: string
}

export const booksDownloadRouter = new URouter<
  BookDownloadQuery,
  ArrayBuffer | undefined
>('books/download', {
  method: 'get',
}).routeLogined(async ({ req, res, userInfo }) => {
  const searchParams = req.searchParams
  const uuid = searchParams.get('uuid')
  if (!uuid) throw new ErrorRequestResponse('book uuid not found')
  const bookEntity: BookEntityBase = await bookManager.entity(
    userInfo.account,
    uuid
  )
  if (!bookEntity) throw new ErrorRequestResponse('book item not found')
  const { contentType, buffer, filename } = await bookEntity.download()
  res.header('Content-Type', contentType)
  res.header(
    'Content-Disposition',
    `attachment; filename="${encodeURI(filename)}"`
  )
  return buffer
})
