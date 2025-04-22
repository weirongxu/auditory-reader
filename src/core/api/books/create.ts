import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'
import { base64ToArrayBuffer } from '../../util/converter.js'

export type BookCreate = {
  name: string
  langCode: LangCode
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
  const buf = base64ToArrayBuffer(body.bufferBase64)
  const uuid = uuidv1()

  const entity: BookTypes.EntityRaw = {
    uuid,
    name: body.name,
    langCode: body.langCode,
    isFavorited: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isTmp: body.isTmp ?? false,
    pageParagraphCounts: null,
    position: null,
  }

  const entityJson = await bookManager.list(userInfo.account).add(entity, buf)

  return entityJson
})
