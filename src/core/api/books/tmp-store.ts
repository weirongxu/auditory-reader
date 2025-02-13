import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { TMP_UUID } from '../../consts.js'
import { URouter } from '../../route/router.js'

export const booksTmpStoreRouter = new URouter<any, BookTypes.EntityJson>(
  'books/tmp-store',
).routeLogined(async ({ userInfo }) => {
  const bookEntityTmp = await bookManager.entity(userInfo.account, TMP_UUID)
  const uuid = uuidv1()

  const entity: BookTypes.EntityRaw = {
    uuid,
    name: bookEntityTmp.entity.name,
    langCode: bookEntityTmp.entity.langCode,
    isFavorited: bookEntityTmp.entity.isFavorited,
    isArchived: bookEntityTmp.entity.isArchived,
    createdAt: new Date(),
    updatedAt: new Date(),
    isTmp: false,
    position: bookEntityTmp.entity.position,
    pageParagraphs: bookEntityTmp.entity.pageParagraphs,
  }

  const buf = await bookEntityTmp.readFileBuffer()
  const pos = await bookEntityTmp.posGet()
  const annotations = await bookEntityTmp.annotationsGet()

  const entityJson = await bookManager.list(userInfo.account).add(entity, buf)

  const bookEntity = await bookManager.entity(userInfo.account, entityJson.uuid)
  await bookEntity.posSet(
    pos ?? {
      section: 0,
      paragraph: 0,
    },
  )
  await bookEntity.annotationsUpsert(annotations)

  return entityJson
})
