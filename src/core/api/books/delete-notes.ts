import { bookManager } from '../../book/book-manager.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

interface BookDeleteNote extends BookViewQuery {
  noteUuids: string[]
}

export const booksDeleteNotesRouter = new URouter<
  BookDeleteNote,
  { ok: boolean }
>('books/delete-notes').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  await bookEntity.notesDelete(body.noteUuids)
  return { ok: true }
})
