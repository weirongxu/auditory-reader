import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

interface BookKeywordDelete extends BookViewQuery {
  keywordUuids: string[]
}

export const booksKeywordsDeleteRouter = new URouter<
  BookKeywordDelete,
  { ok: boolean }
>('books/keywords-delete').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.keywordsDelete(body.keywordUuids)
  return { ok: true }
})
