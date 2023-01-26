import { JSDOM } from 'jsdom'
import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'
import { Readability } from '@mozilla/readability'
import { createEpubBy } from '../../gen/epub.js'

export type BookCreateByUrl = {
  name: string
  langCode: LangCode
  url: string
}

export const booksCreateByUrlRouter = new URouter<
  BookCreateByUrl,
  BookTypes.EntityJson
>('books/create-by-url').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body

  const uuid = uuidv1()

  const date = new Date()
  const entity: BookTypes.Entity = {
    uuid,
    name: body.name,
    type: 'epub',
    langCode: body.langCode,
    createdAt: date,
    updatedAt: date,
  }

  const res = await fetch(body.url)
  const html = await res.text()
  const jsdom = new JSDOM(html)
  const doc = jsdom.window.document
  const article = new Readability(doc).parse()

  if (!article) throw new Error('parse article error')

  const entityJson = await bookManager.list(userInfo.account).add(
    entity,
    await createEpubBy({
      title: body.name,
      date,
      htmlContent: article.content,
      lang: body.langCode,
      publisher: body.url,
      uuid,
    })
  )

  return entityJson
})
