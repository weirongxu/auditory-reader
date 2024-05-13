import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

interface BookDeleteAnnotation extends BookViewQuery {
  annotationUuids: string[]
}

export const booksDeleteAnnotationsRouter = new URouter<
  BookDeleteAnnotation,
  { ok: boolean }
>('books/delete-annotations').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.annotationsDelete(body.annotationUuids)
  return { ok: true }
})
