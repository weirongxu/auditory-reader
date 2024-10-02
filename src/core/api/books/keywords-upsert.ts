import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

type KeywordUpsert = Omit<BookTypes.PropertyKeyword, 'uuid'> & {
  uuid: string | null
}

interface BookKeywordUpsert extends BookViewQuery {
  keywords: KeywordUpsert[]
}

export const booksKeywordsUpsertRouter = new URouter<
  BookKeywordUpsert,
  { ok: boolean; keywords: BookTypes.PropertyKeyword[] }
>('books/keywords-upsert').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const keywords = body.keywords.map((n) => {
    n.uuid = n.uuid || uuidv1()
    return n as BookTypes.PropertyKeyword
  })
  return {
    ok: true,
    keywords: await bookEntity.keywordsUpsert(keywords),
  }
})
