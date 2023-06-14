import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'
import { ErrorRequestResponse } from '../../route/session.js'

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

export const booksTmpStoreRouter = new URouter<any, BookTypes.EntityJson>(
  'books/tmp-store'
).routeLogined(async ({ userInfo }) => {
  const bookEntityTmp = await bookManager.entityTmp(userInfo.account)
  if (!bookEntityTmp) throw new ErrorRequestResponse('Tmp not found')

  const uuid = uuidv1()

  const entity: BookTypes.Entity = {
    uuid,
    name: bookEntityTmp.entity.name,
    type: bookEntityTmp.entity.type,
    langCode: bookEntityTmp.entity.langCode,
    createdAt: new Date(),
    updatedAt: new Date(),
    isTmp: false,
  }

  const buf = await bookEntityTmp.readFileBuffer()
  const pos = await bookEntityTmp.posGet()

  const entityJson = await bookManager.list(userInfo.account).add(entity, buf)

  const bookEntity = await bookManager.entity(userInfo.account, entityJson.uuid)
  await bookEntity.posSet(pos)

  return entityJson
})
