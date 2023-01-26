import type { LangCode } from '../../lang.js'
import { URouter } from '../../route/router.js'
import { fetchDom } from '../../util/http.js'

export type BookFetchUrlInfoQuery = {
  url: string
}

export type BookFetchUrlInfo = {
  title: string
  lang?: LangCode
}

export const booksFetchUrlInfoRouter = new URouter<
  BookFetchUrlInfoQuery,
  BookFetchUrlInfo
>('books/fetch-url-info').routeLogined(async ({ req }) => {
  const body = await req.body

  const jsdom = await fetchDom(body.url)
  const doc = jsdom.window.document
  const titleDom =
    doc.querySelector('h1') ??
    doc.querySelector('meta[name=og\\:title]') ??
    doc.querySelector('head>title')
  const title = titleDom?.textContent ?? ''

  const info: BookFetchUrlInfo = {
    title,
    lang: (doc.activeElement?.getAttribute('lang') ?? undefined) as
      | LangCode
      | undefined,
  }

  return info
})
