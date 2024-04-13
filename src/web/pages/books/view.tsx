import { CircularProgress } from '@mui/material'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SetStateAction,
} from 'react'
import { useParams } from 'react-router-dom'
import { booksPositionRouter } from '../../../core/api/books/position.js'
import { booksSyncPositionRouter } from '../../../core/api/books/sync-position.js'
import {
  booksViewRouter,
  type BookViewRes,
} from '../../../core/api/books/view.js'
import type { BookView } from '../../../core/book/book-base.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { FlexBox } from '../../components/flex-box.js'
import { usePushTitle } from '../../hooks/useTitle.js'
import { NotFound } from '../not-found.js'
import * as styles from './view.module.scss'
import type { BookContextProps } from './view/types'
import { useViewer } from './view/viewer.js'

const useBook = (bookRes: BookViewRes | undefined): BookView | undefined => {
  const [book, setBook] = useState<BookView | undefined>()

  useEffect(() => {
    if (!bookRes) return
    const flattenedNavs = []
    const stack = [...bookRes.navs]
    while (stack.length) {
      const cur = stack.shift()!
      flattenedNavs.push(cur)
      stack.unshift(...cur.children)
    }
    return setBook({
      ...bookRes,
      flattenedNavs,
    })
  }, [bookRes])

  return book
}

export const useBookView = (uuid: string) => {
  const {
    data: bookData,
    error,
    reload: reloadBook,
  } = useAction(booksViewRouter, { uuid })
  const {
    data: posData,
    error: posError,
    reload: reloadPos,
  } = useAction(booksPositionRouter, {
    uuid,
  })
  const [pos, setPosOrigin] = useState<BookTypes.PropertyPosition>()
  const setPos = useCallback(
    (pos: SetStateAction<BookTypes.PropertyPosition | undefined>) => {
      setPosOrigin(pos)
    },
    [],
  )

  const book = useBook(bookData)

  // get pos
  useEffect(() => {
    if (posData) setPosOrigin(posData)
  }, [posData])

  // sync pos
  useEffect(() => {
    if (!pos) return
    booksSyncPositionRouter.action({ uuid, pos }).catch(console.error)
  }, [pos, uuid])

  const reload = useCallback(() => {
    reloadBook()
    reloadPos
  }, [reloadBook, reloadPos])

  return {
    error: error || posError,
    pos,
    setPos,
    book,
    reload,
  }
}

function BookViewContent({
  uuid,
  book,
  pos,
  setPos,
  reload,
}: BookContextProps) {
  const { BookPanelView, MainContent, activeNavs } = useViewer({
    uuid,
    book,
    pos,
    setPos,
    reload,
  })
  const pushTitle = usePushTitle()

  const lastNav = useMemo(() => activeNavs?.at(-1), [activeNavs])

  useEffect(() => {
    let mainTitle = `${book.item.name}`
    if (lastNav) mainTitle = `${lastNav.label} - ${mainTitle}`
    pushTitle(mainTitle)
  }, [book, lastNav, pushTitle])

  return (
    <FlexBox dir="row" className={styles.contentWrapper}>
      {BookPanelView}
      {MainContent}
    </FlexBox>
  )
}

function BookViewReq({ uuid }: { uuid: string }) {
  const { error, pos, setPos, book, reload } = useBookView(uuid)

  if (error) return <NotFound title="book"></NotFound>

  if (!book || !pos) return <CircularProgress></CircularProgress>

  return (
    <BookViewContent
      uuid={uuid}
      book={book}
      pos={pos}
      setPos={setPos}
      reload={reload}
    ></BookViewContent>
  )
}

export function BookView() {
  const { uuid } = useParams<{ uuid: string }>()

  if (!uuid) return <NotFound title="book"></NotFound>

  return <BookViewReq uuid={uuid} />
}
