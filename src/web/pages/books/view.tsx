import { CircularProgress, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { booksPositionRouter } from '../../../core/api/books/position.js'
import { booksSyncPositionRouter } from '../../../core/api/books/sync-position.js'
import { booksViewRouter } from '../../../core/api/books/view.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { useTitle } from '../../hooks/useTitle.js'
import { NotFound } from '../not-found.js'
import styles from './view.module.scss'
import type { BookContextProps } from './view/types'
import { useViewer } from './view/viewer.js'

export const useBookView = (uuid: string) => {
  const { data: bookData, error } = useAction(booksViewRouter, { uuid })
  const { data: posData, error: posError } = useAction(booksPositionRouter, {
    uuid,
  })
  const [pos, setPos] = useState<BookTypes.PropertyPosition>()

  // get pos
  useEffect(() => {
    if (posData) setPos(posData)
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
  const { NavTreeView, MainContent } = useViewer(props)

  return (
    <Stack direction="row" className={styles.contentWrapper}>
      {NavTreeView}
      {MainContent}
    </Stack>
  )
}

function BookViewReq(props: { uuid: string }) {
  const { uuid } = props
  const { error, pos, setPos, book } = useBookView(uuid)

  const [, setTitle] = useTitle()

  useEffect(() => {
    if (!book) return
    setTitle(`${book.item.name} - Speech`)
  }, [book, setTitle])

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
