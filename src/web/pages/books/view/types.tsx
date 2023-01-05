import type { BookViewRes } from '../../../../core/api/books/view.js'
import type { BookTypes } from '../../../../core/book/types.js'

export type BookContextProps = {
  uuid: string
  book: BookViewRes
  pos: BookTypes.PropertyPosition
  setPos: React.Dispatch<
    React.SetStateAction<BookTypes.PropertyPosition | undefined>
  >
}

export type ParagraphElemText = {
  elem: HTMLElement
  text: string
  hash?: string
}
