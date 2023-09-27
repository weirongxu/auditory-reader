import { Buffer } from 'buffer'
import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'

export type BookCreate = {
  name: string
  langCode: LangCode
  type: BookTypes.EntityType
  bufferBase64: string
  /**
   * @default false
   */
  isTmp?: boolean
}

export const booksCreateRouter = new URouter<BookCreate, BookTypes.EntityJson>(
  'books/create',
).routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const buf = Buffer.from(body.bufferBase64, 'base64')
  const uuid = uuidv1()

  const entity: BookTypes.Entity = {
    uuid,
    name: body.name,
    type: body.type,
    langCode: body.langCode,
    createdAt: new Date(),
    updatedAt: new Date(),
    isTmp: body.isTmp ?? false,
  }

  const entityJson = await bookManager.list(userInfo.account).add(entity, buf)

  return entityJson
})
