import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { env } from '../../env.js'
import { EpubGen } from '../../generate/epub-gen.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'
import { HTMLImgs2DataURL } from '../../util/dom.js'
import { fetchDom } from '../../util/http.js'

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
  const entity: BookTypes.Entity = {
    uuid,
    name: body.name,
    type: 'epub',
    langCode: body.langCode,
    isFavorited: false,
    createdAt: date,
    updatedAt: date,
    isTmp: body.isTmp ?? false,
  }

  const jsdom = await fetchDom(body.url)
  const doc = jsdom.window.document
  const article = new Readability(doc).parse()

  if (!article) throw new Error('parse article error')

  const articleJsdom = new JSDOM(article.content)
  const articleDoc = articleJsdom.window.document

  if (env.appMode === 'server')
    await HTMLImgs2DataURL(body.url, articleDoc.body)

  const htmlContent = new articleJsdom.window.XMLSerializer().serializeToString(
    articleDoc.body,
  )

  const epubBuf = await new EpubGen({
    title: body.name,
    date,
    htmlContent,
    lang: body.langCode,
    publisher: body.url,
    sourceURL: body.url,
    uuid,
  }).gen()

  const entityJson = await bookManager
    .list(userInfo.account)
    .add(entity, epubBuf)

  return entityJson
})
