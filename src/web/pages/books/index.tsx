import { Add, DragIndicator } from '@mui/icons-material'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import { t } from 'i18next'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useNavigate } from 'react-router-dom'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksMoveOffsetRouter } from '../../../core/api/books/move-offset.js'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import type { BookPage } from '../../../core/api/books/page.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { useHotkeys } from '../../hotkey/hotkey-state.js'
import { useAppBarSync } from '../layout/use-app-bar.js'
import styles from './index.module.scss'
import { getBooksCoverPath } from '../../../core/api/books/cover.js'
import { globalStore } from '../../store/global.js'
import { previewImgSrcAtom } from '../../common/preview-image.js'
import { useConfirm } from '../../common/confirm.js'

const DragType = 'book'
type DragItem = {
  name: string
  uuid: string
  startIndex: number
  hoverIndex: number
}

function viewPath(uuid: string) {
  return `/books/view/${uuid}`
}

function editPath(uuid: string) {
  return `/books/edit/${uuid}`
}

function useRemoveBooks(reload: () => void) {
  const confirm = useConfirm()

  const removeBooks = useCallback(
    (books: BookTypes.Entity[]) => {
      confirm({
        title: t('remove'),
        description: (
          <ul>
            {books.map((book) => (
              <li key={book.uuid}>{book.name}</li>
            ))}
          </ul>
        ),
      })
        .then(async () => {
          for (const book of books) {
            await booksRemoveRouter.action({
              uuid: book.uuid,
            })
          }
          reload()
        })
        .catch(console.error)
    },
    [confirm, reload]
  )

  return removeBooks
}

function useSelector(books: BookTypes.Entity[] | null) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>()
  const [selectedUuids, setSelectedUuids] = useState<string[]>([])

  const selectedBooks = useMemo(
    () => books?.filter((book) => selectedUuids.includes(book.uuid)) ?? [],
    [books, selectedUuids]
  )

  const allSelected = useMemo(
    () => books?.every((book) => selectedUuids.includes(book.uuid)),
    [books, selectedUuids]
  )

  // if books reload, cancel selected
  useEffect(() => {
    if (books) setSelectedUuids([])
  }, [books])

  const selectTo = useCallback(
    (index: number, shift: boolean) => {
      const book = books?.[index]
      if (!book) return
      setLastSelectedIndex(index)
      let checked = false
      let targetUuids: string[]
      if (
        lastSelectedIndex !== undefined &&
        lastSelectedIndex !== index &&
        shift
      ) {
        if (lastSelectedIndex < index)
          targetUuids = books
            .slice(lastSelectedIndex, index + 1)
            .map((it) => it.uuid)
        else
          targetUuids = books
            .slice(index, lastSelectedIndex + 1)
            .map((it) => it.uuid)
        checked = true
      } else {
        targetUuids = [book.uuid]
        checked = !selectedUuids.includes(book.uuid)
      }

      let tmpUuids = [...selectedUuids]
      for (const targetUuid of targetUuids) {
        if (checked) {
          if (!tmpUuids.includes(targetUuid))
            tmpUuids = [...tmpUuids, targetUuid]
        } else {
          tmpUuids = tmpUuids.filter((uuid) => uuid !== targetUuid)
        }
        setSelectedUuids(tmpUuids)
      }
    },
    [books, lastSelectedIndex, selectedUuids]
  )

  const selectAll = useCallback(() => {
    if (allSelected) setSelectedUuids([])
    else setSelectedUuids(books?.map((book) => book.uuid) ?? [])
  }, [allSelected, books])

  return {
    selectedBooks,
    allSelected,
    selectedUuids,
    selectTo,
    selectAll,
  }
}

function useHomeHotKeys({
  setPage,
  dataBooks,
  selectTo,
  selectAll,
  setLoading,
  reload,
  moveBooksTop,
  removeBooks,
}: {
  setPage: Dispatch<SetStateAction<number>>
  dataBooks: BookPage | null | undefined
  selectTo: (index: number, shift: boolean) => void
  selectAll: () => void
  setLoading: Dispatch<SetStateAction<boolean>>
  reload: () => void
  moveBooksTop: (books: BookTypes.Entity[]) => Promise<void>
  removeBooks: (books: BookTypes.Entity[]) => void
}) {
  const [activedIndex, setActivedIndex] = useState(0)
  const { addHotkeys } = useHotkeys()
  const nav = useNavigate()

  const currentBook = useMemo(
    () => dataBooks?.items[activedIndex],
    [activedIndex, dataBooks]
  )

  useEffect(() => {
    const count = dataBooks?.items.length ?? 0

    const goUp = () => {
      setActivedIndex((activedIndex) =>
        activedIndex > 0 ? activedIndex - 1 : 0
      )
    }

    const goTop = () => {
      setActivedIndex(0)
    }

    const goDown = () => {
      setActivedIndex((activedIndex) =>
        activedIndex < count - 1 ? activedIndex + 1 : activedIndex
      )
    }

    const goBottom = () => {
      setActivedIndex(count - 1)
    }

    const pagePrev = () => {
      if (dataBooks)
        setPage((page) => (page > 1 ? page - 1 : dataBooks.pageCount))
    }

    const pageNext = () => {
      if (dataBooks)
        setPage((page) => (page < dataBooks.pageCount ? page + 1 : 1))
    }

    const moveUp = async () => {
      if (!currentBook) return
      goUp()
      await booksMoveOffsetRouter.action({
        uuid: currentBook.uuid,
        offset: -1,
      })
      reload()
    }

    const moveDown = async () => {
      if (!currentBook) return
      goDown()
      await booksMoveOffsetRouter.action({
        uuid: currentBook.uuid,
        offset: 1,
      })
      reload()
    }

    const select = (shift: boolean) => {
      selectTo(activedIndex, shift)
    }

    const removeBook = () => {
      if (currentBook) removeBooks([currentBook])
    }

    const moveBookTop = () => {
      if (currentBook) void moveBooksTop([currentBook])
    }

    const dispose = addHotkeys([
      ['j', goDown],
      ['k', goUp],
      ['arrowdown', goDown],
      ['arrowup', goUp],
      ['h', pagePrev],
      ['l', pageNext],
      ['arrowleft', pagePrev],
      ['arrowright', pageNext],
      [{ shift: true, key: 'j' }, moveDown],
      [{ shift: true, key: 'k' }, moveUp],
      [{ shift: true, key: 'arrowdown' }, moveDown],
      [{ shift: true, key: 'arrowup' }, moveUp],
      ['t', moveBookTop],
      ['e', () => currentBook && nav(editPath(currentBook.uuid))],
      ['x', () => select(false)],
      ['v', () => select(false)],
      [{ shift: true, key: 'x' }, () => select(true)],
      [{ shift: true, key: 'v' }, () => select(true)],
      [{ shift: true, key: 'a' }, () => selectAll()],
      [
        'Enter',
        () => {
          if (!currentBook) return
          nav(viewPath(currentBook.uuid))
        },
      ],
      [{ shift: true, key: '#' }, removeBook],
      [['d', 'd'], removeBook],
      [['g', 'g'], goTop],
      [{ shift: true, key: 'g' }, goBottom],
    ])
    return dispose
  }, [
    activedIndex,
    addHotkeys,
    currentBook,
    dataBooks,
    moveBooksTop,
    nav,
    reload,
    removeBooks,
    selectAll,
    selectTo,
    setLoading,
    setPage,
  ])

  return { activedIndex }
}

function BookRow({
  index,
  actived,
  book,
  books,
  onHoverMove,
  onDrop,
  onCancel,
  selectedUuids,
  selectTo,
}: {
  index: number
  actived: boolean
  book: BookTypes.Entity
  books: BookTypes.Entity[]
  onHoverMove: (dragIndex: number, hoverIndex: number) => void
  onDrop: (item: DragItem) => void
  onCancel: () => void
  selectedUuids: string[]
  selectTo: (index: number, shift: boolean) => void
}) {
  const nav = useNavigate()
  const refEl = useRef<HTMLTableRowElement>(null)

  const [, drop] = useDrop<DragItem, void>({
    accept: DragType,
    hover(item) {
      const dragIndex = books.findIndex((book) => book.uuid === item.uuid)
      if (dragIndex === -1) return

      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      onHoverMove(dragIndex, hoverIndex)

      item.hoverIndex = hoverIndex
    },
    drop(item) {
      onDrop(item)
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: DragType,
    item: (): DragItem => {
      return {
        name: book.name,
        uuid: book.uuid,
        startIndex: index,
        hoverIndex: index,
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end(_item, monitor) {
      if (!monitor.didDrop()) onCancel()
    },
  })

  useEffect(() => {
    if (actived)
      refEl.current?.scrollIntoView({
        block: 'center',
      })
  }, [actived, drop])

  const [coverLoaded, setCoverLoaded] = useState(false)

  const coverUrl = `${getBooksCoverPath(book.uuid)}`

  const opacity = isDragging ? 0.2 : 1
  drop(refEl)
  return (
    <TableRow ref={refEl} key={book.uuid} sx={{ opacity }} selected={actived}>
      <TableCell
        padding="checkbox"
        ref={drag}
        sx={{
          cursor: 'move',
        }}
      >
        <DragIndicator />
      </TableCell>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedUuids.includes(book.uuid)}
          onClick={(event) => {
            selectTo(index, event.shiftKey)
          }}
        ></Checkbox>
      </TableCell>
      <TableCell padding="none">
        <img
          onClick={() => {
            globalStore.set(previewImgSrcAtom, coverUrl)
          }}
          onLoad={() => {
            setCoverLoaded(true)
          }}
          style={{ maxHeight: '40px', display: coverLoaded ? 'block' : 'none' }}
          src={coverUrl}
          alt={`${book.name} ${t('cover')}`}
        />
      </TableCell>
      <TableCell
        className={styles.hover}
        title={book.createdAt.toLocaleString()}
        onClick={() => {
          nav(viewPath(book.uuid))
        }}
      >
        {book.name}
      </TableCell>
      <TableCell>
        <Stack direction="row">
          <LinkWrap to={editPath(book.uuid)}>
            {(href) => (
              <Button color="success" href={href}>
                {t('edit')}
              </Button>
            )}
          </LinkWrap>
          <Button
            onClick={() => {
              window.open(
                `${booksDownloadRouter.fullRoutePath}?uuid=${book.uuid}`,
                '_blank'
              )
            }}
          >
            {t('export')}
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  )
}

function BookRemoveButton({ onRemove }: { onRemove: (uuid: string) => void }) {
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: DragType,
    drop(item: DragItem) {
      onRemove(item.uuid)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  if (!canDrop) return <></>

  return (
    <Chip
      ref={drop}
      color={isOver ? 'error' : 'warning'}
      size={isOver ? 'medium' : undefined}
      label={t('prompt.dropHereToRemove')}
    />
  )
}

export function BookList() {
  const theme = useTheme()
  const [page, setPage] = useState<number>(1)
  const { data: dataBooks, reload } = useAction(booksPageRouter, { page })
  const [loading, setLoading] = useState<boolean>(false)

  const [books, setBooks] = useState<BookTypes.Entity[] | null>(null)
  const resetBooks = useCallback(() => {
    setBooks(dataBooks ? [...dataBooks.items] : null)
  }, [dataBooks])
  useEffect(() => {
    resetBooks()
  }, [resetBooks])

  const { selectedBooks, allSelected, selectedUuids, selectTo, selectAll } =
    useSelector(books)

  const removeBooks = useRemoveBooks(reload)

  const moveBooksTop = useCallback(
    async (books: BookTypes.Entity[]) => {
      for (const book of [...books.reverse()]) {
        await booksMoveTopRouter.action({
          uuid: book.uuid,
        })
      }
      setPage(1)
      reload()
    },
    [reload]
  )

  const { activedIndex } = useHomeHotKeys({
    setPage,
    dataBooks,
    setLoading,
    reload,
    selectTo,
    selectAll,
    moveBooksTop,
    removeBooks,
  })

  useEffect(() => {
    if (page) reload()
  }, [page, reload])

  const onHoverMove = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (!books) return
      const newBooks = [...books]
      const [entityJson] = newBooks.splice(dragIndex, 1)
      newBooks.splice(hoverIndex, 0, entityJson)
      setBooks(newBooks)
    },
    [books]
  )

  const onDrop = useCallback(
    (item: DragItem) => {
      async(async () => {
        const srcBook = books?.find((it) => it.uuid === item.uuid)
        if (!srcBook) return
        const offset = item.hoverIndex - item.startIndex
        if (offset === 0) return
        setLoading(true)
        await booksMoveOffsetRouter.action({ uuid: item.uuid, offset })
        reload()
        setLoading(false)
      })
    },
    [books, reload]
  )

  const onCancel = useCallback(() => {
    resetBooks()
  }, [resetBooks])

  const onRemove = useCallback(
    (uuid: string) => {
      resetBooks()
      const book = books?.find((book) => book.uuid === uuid)
      if (!book) return
      removeBooks([book])
    },
    [books, removeBooks, resetBooks]
  )

  const OperationBtnGroup = useMemo(() => {
    return (
      !!selectedUuids.length && (
        <ButtonGroup>
          <>
            <Button
              color="secondary"
              onClick={() => {
                async(async () => {
                  await moveBooksTop(selectedBooks)
                  reload()
                })
              }}
            >
              {t('top')}
            </Button>
            <Button
              color="error"
              onClick={() => {
                removeBooks(selectedBooks)
              }}
            >
              {t('remove')}
            </Button>
          </>
        </ButtonGroup>
      )
    )
  }, [moveBooksTop, reload, removeBooks, selectedBooks, selectedUuids.length])

  const TopRightBar = useMemo(() => {
    return (
      <>
        <BookRemoveButton onRemove={onRemove}></BookRemoveButton>
        {OperationBtnGroup}
      </>
    )
  }, [OperationBtnGroup, onRemove])

  const AddBtn = useMemo(
    () => (
      <LinkWrap to="/books/add">
        {(href) => (
          <IconButton href={href} title={t('add')}>
            <Add />
          </IconButton>
        )}
      </LinkWrap>
    ),
    []
  )

  useAppBarSync({
    topRight: TopRightBar,
    bottomRight: AddBtn,
  })

  if (loading || !dataBooks || !books) return <CircularProgress />

  const Pager =
    dataBooks.pageCount > 1 ? (
      <Pagination
        sx={{ marginTop: 2 }}
        onChange={(_, page) => setPage(page)}
        page={page ?? 1}
        count={dataBooks?.pageCount}
      ></Pagination>
    ) : null

  return (
    <>
      {Pager}
      <TableContainer
        sx={{
          marginTop: theme.spacing(2),
        }}
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell padding="checkbox">
                <Checkbox
                  title={t('all')}
                  checked={allSelected}
                  onClick={() => {
                    selectAll()
                  }}
                ></Checkbox>
              </TableCell>
              <TableCell padding="none">{t('cover')}</TableCell>
              <TableCell>{t('bookName')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book, index) => {
              return (
                <BookRow
                  book={book}
                  books={books}
                  index={index}
                  actived={activedIndex === index}
                  onHoverMove={onHoverMove}
                  onDrop={onDrop}
                  onCancel={onCancel}
                  selectTo={selectTo}
                  selectedUuids={selectedUuids}
                  key={book.uuid}
                ></BookRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {Pager}
    </>
  )
}
