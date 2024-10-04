import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import { bookJsonToEntity } from '../../util/book.js'
import { base64ToArrayBuffer } from '../../util/converter.js'

export type BookImportQuery = {
  entity: BookTypes.EntityJson
  property: BookTypes.PropertyJson | null
  bufferBase64: string
}

export const booksImportRouter = new URouter<BookImportQuery, { ok: boolean }>(
  'books/download',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const entity = bookJsonToEntity(body.entity)
  const uuid = uuidv1()
  entity.uuid = uuid
  const buffer = base64ToArrayBuffer(body.bufferBase64)
  await bookManager.list(userInfo.account).add(entity, buffer)
  if (body.property) {
    const bookEntity = await bookManager.entity(userInfo.account, entity.uuid)
    await bookEntity.writeProp(body.property)
  }
  return { ok: true }
})
