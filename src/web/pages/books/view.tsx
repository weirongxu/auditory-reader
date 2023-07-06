import { CircularProgress, Stack } from '@mui/material'
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
import { booksViewRouter } from '../../../core/api/books/view.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { usePushTitle } from '../../hooks/useTitle.js'
import { NotFound } from '../not-found.js'
import styles from './view.module.scss'
import type { BookContextProps } from './view/types'
import { useViewer } from './view/viewer.js'

export const useBookView = (uuid: string) => {
  const { data: bookData, error } = useAction(booksViewRouter, { uuid })
  const { data: posData, error: posError } = useAction(booksPositionRouter, {
    uuid,
  })
  const [pos, setPosOrigin] = useState<BookTypes.PropertyPosition>()
  const setPos = useCallback(
    (pos: SetStateAction<BookTypes.PropertyPosition | undefined>) => {
      setPosOrigin(pos)
    },
    []
  )

  // get pos
  useEffect(() => {
    if (posData) setPosOrigin(posData)
  }, [posData])

  // sync pos
  useEffect(() => {
    if (!pos) return
    booksSyncPositionRouter.action({ uuid, pos }).catch(console.error)
  }, [pos, uuid])

  return {
    error: error || posError,
    pos,
    setPos,
    book: bookData,
  }
}

function BookViewContent(props: BookContextProps) {
  const { book } = props
  const { BookPanelView, MainContent, activeNavs } = useViewer(props)
  const pushTitle = usePushTitle()

  const lastNav = useMemo(() => activeNavs?.at(-1), [activeNavs])

  useEffect(() => {
    let mainTitle = `${book.item.name}`
    if (lastNav) mainTitle = `${lastNav.label} - ${mainTitle}`
    pushTitle(mainTitle)
  }, [book, lastNav, pushTitle])

  return (
    <Stack direction="row" className={styles.contentWrapper}>
      {BookPanelView}
      {MainContent}
    </Stack>
  )
}

function BookViewReq(props: { uuid: string }) {
  const { uuid } = props
  const { error, pos, setPos, book } = useBookView(uuid)

  if (error) return <NotFound title="book"></NotFound>

  if (!book || !pos) return <CircularProgress></CircularProgress>

  return (
    <BookViewContent
      uuid={uuid}
      book={book}
      pos={pos}
      setPos={setPos}
    ></BookViewContent>
  )
}

export function BookView() {
  const { uuid } = useParams<{ uuid: string }>()

  if (!uuid) return <NotFound title="book"></NotFound>

  return <BookViewReq uuid={uuid} />
}
