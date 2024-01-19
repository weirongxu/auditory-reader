import { Add, DragIndicator, MoreVert } from '@mui/icons-material'
import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
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
import { getBooksCoverPath } from '../../../core/api/books/cover.js'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksMoveOffsetRouter } from '../../../core/api/books/move-offset.js'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import type { BookPage } from '../../../core/api/books/page.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { Speech } from '../../../core/util/speech.js'
import { useConfirm } from '../../common/confirm.js'
import { previewImgSrcAtom } from '../../common/preview-image.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { useHotkeys } from '../../hotkey/hotkey-state.js'
import { useGetVoice, usePersonReplace, useSpeechSpeed } from '../../store.js'
import { globalStore } from '../../store/global.js'
import { useAppBarSync } from '../layout/use-app-bar.js'
import styles from './index.module.scss'
import { useBookEditDialog } from './edit.js'

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
    [confirm, reload],
  )

  return removeBooks
}

function useSelector(books: BookTypes.Entity[] | null) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>()
  const [selectedUuids, setSelectedUuids] = useState<string[]>([])

  const selectedBooks = useMemo(
    () => books?.filter((book) => selectedUuids.includes(book.uuid)) ?? [],
    [books, selectedUuids],
  )

  const allSelected = useMemo(
    () => books?.every((book) => selectedUuids.includes(book.uuid)),
    [books, selectedUuids],
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
    [books, lastSelectedIndex, selectedUuids],
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
  selectedBooks,
  reload,
  moveBooksTop,
  removeBooks,
}: {
  setPage: Dispatch<SetStateAction<number>>
  dataBooks: BookPage | null | undefined
  selectTo: (index: number, shift: boolean) => void
  selectAll: () => void
  selectedBooks: BookTypes.Entity[]
  reload: () => void
  moveBooksTop: (books: BookTypes.Entity[]) => Promise<void>
  removeBooks: (books: BookTypes.Entity[]) => void
}) {
  const [activedIndex, setActivedIndex] = useState(0)
  const [isPersonReplace] = usePersonReplace()
  const [speechSpeed] = useSpeechSpeed()
  const { getVoice } = useGetVoice()
  const { addHotkeys } = useHotkeys()
  const { openBookEdit } = useBookEditDialog(reload)
  const nav = useNavigate()

  const currentBook = useMemo(
    () => dataBooks?.items[activedIndex],
    [activedIndex, dataBooks],
  )

  useEffect(() => {
    const count = dataBooks?.items.length ?? 0

    const goPrev = () => {
      setActivedIndex((activedIndex) =>
        activedIndex > 0 ? activedIndex - 1 : 0,
      )
    }

    const goTop = () => {
      setActivedIndex(0)
    }

    const goNext = () => {
      setActivedIndex((activedIndex) =>
        activedIndex < count - 1 ? activedIndex + 1 : activedIndex,
      )
    }

    const goBottom = () => {
      setActivedIndex(count - 1)
    }

    const pagePrev = () => {
      if (dataBooks) {
        setPage((page) => (page > 1 ? page - 1 : dataBooks.pageCount))
        goTop()
      }
    }

    const pageFirst = () => {
      if (dataBooks) setPage(1)
    }

    const pageNext = () => {
      if (dataBooks) {
        setPage((page) => (page < dataBooks.pageCount ? page + 1 : 1))
        goTop()
      }
    }

    const pageLast = () => {
      if (dataBooks) setPage(dataBooks.pageCount)
    }

    const movePrev = async () => {
      if (!currentBook) return
      goPrev()
      await booksMoveOffsetRouter.action({
        uuid: currentBook.uuid,
        offset: -1,
      })
      reload()
    }

    const moveNext = async () => {
      if (!currentBook) return
      goNext()
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
      if (currentBook) removeBooks(selectedBooks)
    }

    const moveBookTop = () => {
      if (currentBook) void moveBooksTop(selectedBooks)
    }

    const speech = new Speech()
    const speakBookName = () => {
      if (!currentBook) return
      const voice = getVoice(currentBook)
      if (!voice) return
      void speech.speak(currentBook.name, {
        voice,
        speed: speechSpeed,
        isPersonReplace,
      })
    }

    return addHotkeys([
      ['k', t('hotkey.goPrev'), goPrev],
      ['j', t('hotkey.goNext'), goNext],
      ['ArrowUp', t('hotkey.goPrev'), goPrev],
      ['ArrowDown', t('hotkey.goNext'), goNext],
      ['h', t('hotkey.goPagePrev'), pagePrev],
      ['l', t('hotkey.goPageNext'), pageNext],
      ['ArrowLeft', t('hotkey.goPagePrev'), pagePrev],
      ['ArrowRight', t('hotkey.goPageNext'), pageNext],
      [{ ctrl: true, key: 'k' }, t('hotkey.goMovePrev'), movePrev],
      [{ ctrl: true, key: 'j' }, t('hotkey.goMoveNext'), moveNext],
      [{ ctrl: true, key: 'ArrowUp' }, t('hotkey.goMovePrev'), movePrev],
      [{ ctrl: true, key: 'ArrowDown' }, t('hotkey.goMoveNext'), moveNext],
      ['t', t('hotkey.goMoveTop'), moveBookTop],
      [
        'e',
        t('hotkey.edit'),
        () => currentBook && openBookEdit(currentBook.uuid),
      ],
      ['x', t('hotkey.select'), () => select(false)],
      ['v', t('hotkey.select'), () => select(false)],
      [{ shift: true, key: 'x' }, t('hotkey.selectShift'), () => select(true)],
      [{ shift: true, key: 'v' }, t('hotkey.selectShift'), () => select(true)],
      [{ shift: true, key: 'a' }, t('hotkey.selectAll'), () => selectAll()],
      [
        'Enter',
        t('hotkey.open'),
        () => {
          if (!currentBook) return
          nav(viewPath(currentBook.uuid))
        },
      ],
      [{ shift: true, key: '#' }, t('hotkey.remove'), removeBook],
      [['d', 'd'], t('hotkey.remove'), removeBook],
      [['g', 'g'], t('hotkey.goTop'), goTop],
      [{ shift: true, key: 'g' }, t('hotkey.goBottom'), goBottom],
      [{ shift: true, key: 'h' }, t('hotkey.goPageFirst'), pageFirst],
      [{ shift: true, key: 'l' }, t('hotkey.goPageLast'), pageLast],
      [{ shift: true, key: 'K' }, t('hotkey.speakBookName'), speakBookName],
    ])
  }, [
    activedIndex,
    addHotkeys,
    currentBook,
    dataBooks,
    getVoice,
    isPersonReplace,
    moveBooksTop,
    nav,
    openBookEdit,
    reload,
    removeBooks,
    selectAll,
    selectTo,
    selectedBooks,
    setPage,
    speechSpeed,
  ])

  return { activedIndex }
}

function BookButtons({ book }: { book: BookTypes.Entity }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { openBookEdit } = useBookEditDialog()

  const exportBook = useCallback(() => {
    window.open(
      `${booksDownloadRouter.fullRoutePath}?uuid=${book.uuid}`,
      '_blank',
    )
  }, [book.uuid])

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVert></MoreVert>
      </IconButton>
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => openBookEdit(book.uuid)}>{t('edit')}</MenuItem>
        <MenuItem onClick={() => exportBook()}>{t('export')} Epub</MenuItem>
      </Menu>
    </>
  )
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
        padding="none"
        ref={drag}
        sx={{
          cursor: 'move',
        }}
      >
        <DragIndicator />
      </TableCell>
      <TableCell padding="none">
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
          style={{
            maxHeight: '40px',
            display: coverLoaded ? 'block' : 'none',
            cursor: 'pointer',
          }}
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
      <TableCell padding="none">
        <BookButtons book={book}></BookButtons>
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
  const { data: dataBooks, reload } = useAction(
    booksPageRouter,
    { page },
    {
      autoLoad: false,
      clearWhenReload: false,
    },
  )
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
    [reload],
  )

  const { activedIndex } = useHomeHotKeys({
    setPage,
    dataBooks,
    reload,
    selectTo,
    selectAll,
    selectedBooks,
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
    [books],
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
    [books, reload],
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
    [books, removeBooks, resetBooks],
  )

  const OperationBtnGroup = useMemo(() => {
    return (
      !!selectedUuids.length && (
        <ButtonGroup>
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
    [],
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

  if (!books.length)
    return <Alert severity="warning">{t('prompt.noBooks')}</Alert>

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
              <TableCell width="8px" padding="none"></TableCell>
              <TableCell padding="none">
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
              <TableCell padding="none"></TableCell>
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
