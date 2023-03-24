import type { Identifier, XYCoord } from 'dnd-core'
import {
  Button,
  ButtonGroup,
  Checkbox,
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
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useCallback } from 'react'

const DragType = 'book'
type DragItem = {
  index: number
  id: string
}

export function BookRow({
  index,
  book,
  books,
  onMove,
  onDrop,
  selectedUuids,
  setSelectedUuids,
  lastSelectedIndex,
  setLastSelectedIndex,
}: {
  index: number
  book: BookTypes.Entity
  books: BookTypes.Entity[]
  onMove: (dragIndex: number, hoverIndex: number) => void
  onDrop: (dropIndex: number) => void
  selectedUuids: string[]
  setSelectedUuids: (value: string[]) => void
  lastSelectedIndex: number | undefined
  setLastSelectedIndex: (value: number) => void
}) {
  const nav = useNavigate()

  const ref = useRef<HTMLTableRowElement>(null)
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: DragType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = books.findIndex((book) => book.uuid === item.id)
      if (dragIndex === -1) return
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: DragType,
    item: () => {
      return { id: book.uuid, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end(item) {
      onDrop(item.index)
    },
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <TableRow
      hover
      key={book.uuid}
      sx={{ cursor: 'pointer', opacity }}
      ref={ref}
      data-handler-id={handlerId}
      onClick={() => {
        nav(`/books/view/${book.uuid}`)
      }}
    >
      <TableCell
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
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
      <TableCell title={book.createdAt.toLocaleString()}>{book.name}</TableCell>
      <TableCell>
        <Stack
          direction="row"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
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

export function BookList() {
  const theme = useTheme()
  const confirm = useConfirm()
  const [page, setPage] = useState<number>()
  const { data: dataBooks, reload } = useAction(booksPageRouter, { page })
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>()
  const [selectedUuids, setSelectedUuids] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [books, setBooks] = useState<BookTypes.Entity[] | null>(null)
  useEffect(() => {
    setBooks(dataBooks ? [...dataBooks.items] : null)
  }, [dataBooks])

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

  useEffect(() => {
    if (page) reload()
  }, [page, reload])

  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null)
  const [dragStartUuid, setDragStartUuid] = useState<string | null>(null)
  const onMove = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      if (!books) return
      if (dragStartIndex === null) {
        setDragStartIndex(dragIndex)
        setDragStartUuid(books[dragIndex]?.uuid ?? null)
      }
      const newBooks = [...books]
      const [entityJson] = newBooks.splice(dragIndex, 1)
      newBooks.splice(hoverIndex, 0, entityJson)
      setBooks(newBooks)
    },
    [books, dragStartIndex]
  )

  const onDrop = useCallback(
    (dropIndex: number) => {
      async(async () => {
        if (dragStartIndex === null || dragStartUuid === null) return
        const srcBook = books?.find((it) => it.uuid === dragStartUuid)
        if (!srcBook) return
        const offset = dropIndex - dragStartIndex
        setDragStartIndex(null)
        setDragStartUuid(null)
        if (offset === 0) return
        setLoading(true)
        await booksMoveOffsetRouter.action({ uuid: dragStartUuid, offset })
        reload()
        setLoading(false)
      })
    },
    [books, dragStartIndex, dragStartUuid, reload]
  )

  // const [tableBodyElem, setTableBodyElem] =
  //   useState<HTMLTableSectionElement | null>(null)
  // // drag drop
  // useEffect(() => {
  //   const root = tableBodyElem
  //   if (!root) return
  //
  //   // const sortable = new Sortable(root, {
  //   //   setData() {},
  //   //   onMove(event) {
  //   //     return false
  //   //   },
  //   //   onChange(event) {
  //   //     console.log('change')
  //   //     if (
  //   //       !books ||
  //   //       event.oldIndex === undefined ||
  //   //       event.newIndex === undefined
  //   //     )
  //   //       return
  //   //     const newBooks = [...books]
  //   //     const [entityJson] = newBooks.splice(event.oldIndex, 1)
  //   //     newBooks.splice(event.newIndex, 0, entityJson)
  //   //     setBooks(newBooks)
  //   //   },
  //   //   onEnd(event) {
  //   //     async(async () => {
  //   //       if (event.oldIndex === undefined || event.newIndex === undefined)
  //   //         return
  //   //       const srcBook = books?.[event.oldIndex]
  //   //       if (!srcBook) return
  //   //       const offset = event.newIndex - event.oldIndex
  //   //       if (offset === 0) return
  //   //       setLoading(true)
  //   //       await booksMoveOffsetRouter.action({ uuid: srcBook.uuid, offset })
  //   //       setLoading(false)
  //   //       console.log(event.oldIndex)
  //   //       console.log(event.newIndex)
  //   //       console.log(srcBook.name)
  //   //       console.log(offset)
  //   //     })
  //   //   },
  //   // })
  //
  //   let fromIndex: number | null = null
  //   let toIndex: number | null = null
  //
  //   root.addEventListener('dragstart', (event) => {
  //     if (!event.target || !event.dataTransfer) return
  //
  //     fromIndex = Array.from(root.children).indexOf(
  //       event.target as HTMLTableRowElement
  //     )
  //     toIndex = null
  //   })
  //
  //   root.addEventListener('dragover', (event) => {
  //     if (!event.dataTransfer || !books || fromIndex === null) return
  //     event.preventDefault()
  //
  //     toIndex = Array.from(root.children).indexOf(
  //       event.target as HTMLTableRowElement
  //     )
  //     const newBooks = [...books]
  //     const [entity] = newBooks.splice(fromIndex, 1)
  //     newBooks.splice(toIndex, 0, entity)
  //     setBooks(newBooks)
  //     console.log(fromIndex, toIndex)
  //     event.dataTransfer.dropEffect = 'move'
  //   })
  //
  //   root.addEventListener('drop', (event) => {
  //     async(async () => {
  //       toIndex = Array.from(root.children).indexOf(
  //         event.target as HTMLTableRowElement
  //       )
  //       if (fromIndex === null || toIndex === null) return
  //
  //       const srcBook = books?.[fromIndex]
  //       if (!srcBook) return
  //       const offset = fromIndex - toIndex
  //       console.log(srcBook.name, offset)
  //       if (offset === 0) return
  //       setLoading(true)
  //       await booksMoveOffsetRouter.action({ uuid: srcBook.uuid, offset })
  //       reload()
  //       setLoading(false)
  //     })
  //   })
  // }, [books, reload, tableBodyElem])

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
              <TableCell>
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
              <TableCell>
                {!!selectedUuids.length && (
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
                          confirm({
                            title: t('remove'),
                            description: (
                              <ul>
                                {selectedBooks.map((book) => (
                                  <li key={book.uuid}>{book.name}</li>
                                ))}
                              </ul>
                            ),
                          })
                            .then(async () => {
                              for (const book of selectedBooks) {
                                await booksRemoveRouter.action({
                                  uuid: book.uuid,
                                })
                              }
                              reload()
                            })
                            .catch(console.error)
                        }}
                      >
                        {t('remove')}
                      </Button>
                    </>
                  </ButtonGroup>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book, index) => {
              return (
                <BookRow
                  book={book}
                  books={books}
                  index={index}
                  onMove={onMove}
                  onDrop={onDrop}
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
