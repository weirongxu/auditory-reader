import { DragIndicator } from '@mui/icons-material'
import {
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  CircularProgress,
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
import { useConfirm } from 'material-ui-confirm'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useNavigate } from 'react-router-dom'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksMoveOffsetRouter } from '../../../core/api/books/move-offset.js'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { useAppBarSync } from '../layout/use-app-bar.js'
import styles from './index.module.scss'

const DragType = 'book'
type DragItem = {
  name: string
  uuid: string
  startIndex: number
  hoverIndex: number
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

function BookRow({
  index,
  book,
  books,
  onHoverMove,
  onDrop,
  onCancel,
  selectedUuids,
  setSelectedUuids,
  lastSelectedIndex,
  setLastSelectedIndex,
}: {
  index: number
  book: BookTypes.Entity
  books: BookTypes.Entity[]
  onHoverMove: (dragIndex: number, hoverIndex: number) => void
  onDrop: (item: DragItem) => void
  onCancel: () => void
  selectedUuids: string[]
  setSelectedUuids: (value: string[]) => void
  lastSelectedIndex: number | undefined
  setLastSelectedIndex: (value: number) => void
}) {
  const nav = useNavigate()

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

  const opacity = isDragging ? 0.2 : 1
  return (
    <TableRow ref={drop} key={book.uuid} sx={{ opacity }}>
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
            setLastSelectedIndex(index)
            let checked = false
            let targetUuids: string[]
            if (
              lastSelectedIndex !== undefined &&
              lastSelectedIndex !== index &&
              event.shiftKey
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
          }}
        ></Checkbox>
      </TableCell>
      <TableCell
        className={styles.hover}
        title={book.createdAt.toLocaleString()}
        onClick={() => {
          nav(`/books/view/${book.uuid}`)
        }}
      >
        {book.name}
      </TableCell>
      <TableCell>
        <Stack direction="row">
          <LinkWrap to={`/books/edit/${book.uuid}`}>
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
  const [page, setPage] = useState<number>()
  const { data: dataBooks, reload } = useAction(booksPageRouter, { page })
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>()
  const [selectedUuids, setSelectedUuids] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [books, setBooks] = useState<BookTypes.Entity[] | null>(null)
  const resetBooks = useCallback(() => {
    setBooks(dataBooks ? [...dataBooks.items] : null)
  }, [dataBooks])
  useEffect(() => {
    resetBooks()
  }, [resetBooks])

  const selectedBooks = useMemo(
    () => books?.filter((book) => selectedUuids.includes(book.uuid)) ?? [],
    [books, selectedUuids]
  )

  const allSelected = useMemo(
    () => books?.every((book) => selectedUuids.includes(book.uuid)),
    [books, selectedUuids]
  )

  const removeBooks = useRemoveBooks(reload)

  // if books reload, cancel selected
  useEffect(() => {
    if (books) setSelectedUuids([])
  }, [books])

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
                  for (const book of [...selectedBooks].reverse()) {
                    await booksMoveTopRouter.action({
                      uuid: book.uuid,
                    })
                  }
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
  }, [reload, removeBooks, selectedBooks, selectedUuids.length])

  const TopRightBar = useMemo(() => {
    return (
      <>
        <BookRemoveButton onRemove={onRemove}></BookRemoveButton>
        {OperationBtnGroup}
      </>
    )
  }, [OperationBtnGroup, onRemove])

  useAppBarSync({
    topRight: TopRightBar,
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
                    if (allSelected) setSelectedUuids([])
                    else setSelectedUuids(books.map((book) => book.uuid))
                  }}
                ></Checkbox>
              </TableCell>
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
                  onHoverMove={onHoverMove}
                  onDrop={onDrop}
                  onCancel={onCancel}
                  lastSelectedIndex={lastSelectedIndex}
                  setLastSelectedIndex={setLastSelectedIndex}
                  selectedUuids={selectedUuids}
                  setSelectedUuids={setSelectedUuids}
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
