import mime from 'mime-types'
import path from '@file-services/path'
import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import { jsDOMParser } from '../../util/dom.js'
import { ReadableExtractor } from '../../util/readable.js'
import { arrayBufferToString } from '../../util/converter.js'

export type BookSearchQuery = {
  uuid: string
  search: string
}

export type BookSearchResponse = {
  search: string
  matches: BookSearchMatch[]
}

export type BookSearchMatch = {
  text: string
  section: number
  paragraph: number
  start: number
  nav?: string
}

function searchAllIndex(content: string, search: string) {
  const indexes: number[] = []
  let startIndex = 0
  while (startIndex !== -1) {
    startIndex = content.indexOf(search, startIndex)
    if (startIndex !== -1) {
      indexes.push(startIndex)
      startIndex += search.length
    }
  }
  return indexes
}

export const booksSearchRouter = new URouter<
  BookSearchQuery,
  BookSearchResponse
>('books/search').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const book = await bookManager.book(userInfo.account, body.uuid)
  const navs = await book.navs()
  const matches: BookSearchMatch[] = []
  for (const [section, spine] of book.spines.entries()) {
    const filepath = spine.href
    const file = await book.file(filepath)
    if (!file) continue
    const content = arrayBufferToString(file.buffer)
    const contType = file.mediaType ?? mime.contentType(path.basename(filepath))
    if (
      contType &&
      ['/xml', '/html', '/xhtml'].some((t) => contType.includes(t))
    ) {
      const { doc } = await jsDOMParser(content)
      const readableExtractor = new ReadableExtractor(doc, navs)
      const parts = readableExtractor.toReadableParts()
      const nav = navs.find((it) => it.spineIndex === section)
      for (const [paragraph, part] of parts.entries()) {
        if (part.type !== 'text') continue
        const startIndexes = searchAllIndex(part.text, body.search)
        if (!startIndexes.length) continue
        for (const startIndex of startIndexes)
          matches.push({
            text: part.text,
            section,
            paragraph,
            start: startIndex,
            nav: nav?.label,
          })
      }
    }
  }
  return { search: body.search, matches }
})
