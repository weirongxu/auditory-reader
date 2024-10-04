import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'

export type BookDownloadQuery = {
  uuid: string
}

export const booksDownloadRouter = new URouter<
  BookDownloadQuery,
  ArrayBuffer | undefined
>('books/download').routeLogined(async ({ req, res, userInfo }) => {
  const body = await req.body
  const uuid = body.uuid
  const bookEntity = await bookManager.entity(userInfo.account, uuid)
  const { contentType, buffer, filename } = await bookEntity.download()
  res.header('Content-Type', contentType)
  res.header(
    'Content-Disposition',
    `attachment; filename="${encodeURI(filename)}"`,
  )
  return buffer
})
