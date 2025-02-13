import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { htmlToEpub } from '../../generate/converters.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'
import { fetchHtml } from '../../util/http.js'

export type BookCreateByUrl = {
  name: string
  langCode: LangCode
  url: string
  /**
   * @default false
   */
  isTmp?: boolean
}

export const booksCreateByUrlRouter = new URouter<
  BookCreateByUrl,
  BookTypes.EntityJson
>('books/create-by-url').routeLogined(async ({ req, userInfo }) => {
  const body: BookCreateByUrl = await req.body

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

  const html = await fetchHtml(body.url)

  const epubBuf = await htmlToEpub(html, body.langCode, body.url)

  const entityJson = await bookManager
    .list(userInfo.account)
    .add(entity, epubBuf)

  return entityJson
})
