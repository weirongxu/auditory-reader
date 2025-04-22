import { atom, useAtom } from 'jotai'
import type { BookTypes } from '../../../core/book/types.js'
import type { BookView } from './view.js'

export type BookContextProps = {
  uuid: string
  book: BookView
  pageParagraphs: BookTypes.PageParagraph[] | null
  pos: BookTypes.PropertyPosition
  setPos: React.Dispatch<
    React.SetStateAction<BookTypes.PropertyPosition | undefined>
  >
  reload: () => void
}

export const bookContextAtom = atom<BookContextProps | null>(null)

export const useBookContext = () => {
  const [bookContext] = useAtom(bookContextAtom)
  if (!bookContext)
    throw new Error('BookContext must be used within a BookProvider')
  return bookContext
}
