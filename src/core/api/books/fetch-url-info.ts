import { Readability } from '@mozilla/readability'
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
  const article = new Readability(doc).parse()
  let title: string, lang: string | undefined
  if (article) {
    title = article.title
    // @ts-ignore
    lang = article.lang as string | undefined
  } else {
    const titleDom =
      doc.querySelector('article h1') ??
      doc.querySelector('h1') ??
      doc.querySelector('meta[name=og\\:title]') ??
      doc.querySelector('head>title')
    title = titleDom?.textContent?.trim() ?? ''
  }

  lang ??= doc.activeElement?.getAttribute('lang') ?? undefined

  if (lang && lang.includes('-')) lang = lang.split('-')[0]

  const info: BookFetchUrlInfo = {
    title,
    lang: lang as LangCode | undefined,
  }

  return info
})
