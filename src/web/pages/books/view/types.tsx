import type { BookView } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'

export type BookContextProps = {
  uuid: string
  book: BookView
  pos: BookTypes.PropertyPosition
  setPos: React.Dispatch<
    React.SetStateAction<BookTypes.PropertyPosition | undefined>
  >
  reload: () => void
}

interface ReadablePartBase {
  elem: HTMLElement
  anchorIds: string[] | undefined
  navAnchorIds: string[] | undefined
}

export interface ReadablePartText extends ReadablePartBase {
  type: 'text'
  text: string
}

export interface ReadablePartImage extends ReadablePartBase {
  type: 'image'
}

export type ReadablePart = ReadablePartText | ReadablePartImage

export interface TextAlias {
  source: string
  target: string
}

export interface Rect {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}
