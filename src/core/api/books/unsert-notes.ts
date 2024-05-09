import { v1 as uuidv1 } from 'uuid'
import { bookManager } from '../../book/book-manager.js'
import type { BookTypes } from '../../book/types.js'
import { URouter } from '../../route/router.js'
import type { BookViewQuery } from './view.js'

type UnsertNote = Omit<BookTypes.PropertyNote, 'uuid'> & {
  uuid?: BookTypes.EntityUUID
}

interface BookUnsertNote extends BookViewQuery {
  notes: UnsertNote[]
}

export const booksUnsertNotesRouter = new URouter<
  BookUnsertNote,
  { ok: boolean; notes: BookTypes.PropertyNote[] }
>('books/unsert-notes').routeLogined(async ({ req, userInfo }) => {
  const body = await req.body
  const bookEntity = await bookManager.entity(userInfo.account, body.uuid)
  const notes = body.notes.map((n) => {
    if (!n.uuid) n.uuid = uuidv1()
    return n as BookTypes.PropertyNote
  })
  await bookEntity.notesUnsert(notes)
  return { ok: true, notes }
})
