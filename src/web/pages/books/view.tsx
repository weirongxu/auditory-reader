import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { booksPositionSyncRouter } from '../../../core/api/books/position-sync.js'
import { booksPositionRouter } from '../../../core/api/books/position.js'
import { booksViewRouter } from '../../../core/api/books/view.js'
import type { BookView } from '../../../core/book/book-base.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { useFetch } from '../../../core/route/use-fetch.js'
import { FlexBox } from '../../components/flex-box.js'
import { SpinCenter } from '../../components/spin.js'
import { usePushTitle } from '../../hooks/use-title.js'
import { NotFound } from '../not-found.js'
import { bookContextAtom, useBookContext } from './view.context.js'
import styles from './view.module.scss'
import { useViewer } from './view/viewer.js'

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
  } = useFetch(
    [bookData],
    async (bookData): Promise<BookTypes.PropertyPosition | undefined> => {
      if (!bookData) return
      return booksPositionRouter.json({ uuid: bookData.item.uuid })
    },
  )
  const [pos, setPos] = useState<BookTypes.PropertyPosition>()
  const section = pos?.section
  const paragraph = pos?.paragraph

  // flatten navs
  const book: BookView | undefined = useMemo(() => {
    if (!bookData) return undefined
    const flattenedNavs = []
    const stack = [...bookData.navs]
    while (stack.length) {
      const cur = stack.shift()!
      flattenedNavs.push(cur)
      stack.unshift(...cur.children)
    }
    return {
      ...bookData,
      flattenedNavs,
    }
  }, [bookData])

  // get pos
  useEffect(() => {
    if (posData) setPos(posData)
  }, [posData])

  // sync pos
  useEffect(() => {
    if (book === undefined || section === undefined || paragraph === undefined)
      return
    booksPositionSyncRouter
      .json({ uuid: book.item.uuid, pos: { section, paragraph } })
      .catch(console.error)
  }, [book, paragraph, section])

  const reload = useCallback(() => {
    reloadBook()
    reloadPos()
  }, [reloadBook, reloadPos])

  return {
    error: error || posError,
    pos,
    setPos,
    book,
    reload,
  }
}

function BookViewContent() {
  const { book } = useBookContext()
  const { BookPanelView, MainContent, activeNavs } = useViewer()
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
  const [bookContext, setBookContext] = useAtom(bookContextAtom)

  useEffect(() => {
    if (book && pos)
      setBookContext({
        uuid: book.item.uuid,
        book,
        pos,
        setPos,
        reload,
      })
    else setBookContext(null)
  }, [book, pos, reload, setBookContext, setPos])

  if (error) return <NotFound title="book"></NotFound>

  if (!book || !pos) return <SpinCenter></SpinCenter>

  if (!bookContext) return <SpinCenter></SpinCenter>

  return <BookViewContent></BookViewContent>
}

export function BookView() {
  const { uuid } = useParams<{ uuid: string }>()

  if (!uuid) return <NotFound title="book"></NotFound>

  return <BookViewReq uuid={uuid} />
}
