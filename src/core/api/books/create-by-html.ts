import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { htmlToEpub } from '../../generate/converters.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'

export type BookCreateByHtml = {
  name: string
  langCode: LangCode
  html: string
  /**
   * @default false
   */
  isTmp?: boolean
}

export const booksCreateByHtmlRouter = new URouter<
  BookCreateByHtml,
  BookTypes.EntityJson
>('books/create-by-html').routeLogined(async ({ req, userInfo }) => {
  const body: BookCreateByHtml = await req.body

  const uuid = uuidv1()

  const date = new Date()
  const entity: BookTypes.EntityRaw = {
    uuid,
    name: body.name,
    langCode: body.langCode,
    isFavorited: false,
    isArchived: false,
    createdAt: date,
    updatedAt: date,
    isTmp: body.isTmp ?? false,
    position: null,
    pageParagraphs: null,
  }

  const epubBuf = await htmlToEpub(body.html, body.langCode)

  const entityJson = await bookManager
    .list(userInfo.account)
    .add(entity, epubBuf)

  return entityJson
})
