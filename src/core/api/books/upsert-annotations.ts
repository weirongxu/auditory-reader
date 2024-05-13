import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

type UpsertAnnotation = Omit<BookTypes.PropertyAnnotation, 'uuid'> & {
  uuid: string | null
}

interface BookUpsertAnnotation extends BookViewQuery {
  annotations: UpsertAnnotation[]
}

export const booksUpsertAnnotationsRouter = new URouter<
  BookUpsertAnnotation,
  { ok: boolean; annotations: BookTypes.PropertyAnnotation[] }
>('books/upsert-annotations').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const annotations = body.annotations.map((n) => {
    n.uuid = n.uuid || uuidv1()
    return n as BookTypes.PropertyAnnotation
  })
  return {
    ok: true,
    annotations: await bookEntity.annotationsUpsert(annotations),
  }
})
