import {
  Add,
  DragIndicator,
  MoreVert,
  Star,
  StarBorder,
} from '@mui/icons-material'
import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from '@mui/material'
import { Spin } from 'antd'
import { t } from 'i18next'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBooksCoverPath } from '../../../core/api/books/cover.js'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksMoveAfterRouter } from '../../../core/api/books/move-after.js'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import type { BookPage } from '../../../core/api/books/page.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import { booksUpdateRouter } from '../../../core/api/books/update.js'
import { sortOrders, type SortOrder } from '../../../core/book/enums.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { Speech } from '../../../core/util/speech.js'
import { uiConfirm } from '../../common/confirm.js'
import { previewImgSrcAtom } from '../../common/preview-image.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { useSyncedDebounced } from '../../hooks/use-synced-debounce.js'
import { useHotkeys, type HotkeyItem } from '../../hotkey/hotkey-state.js'
import { useGetVoice, usePersonReplace, useSpeechSpeed } from '../../store.js'
import { globalStore } from '../../store/global.js'
import { useAppBarSync } from '../layout/use-app-bar.js'
import { useBookEditDialog } from './edit.js'
import * as styles from './index.module.scss'
import { SpinCenter } from '../../components/spin.js'

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

const moveOffset = async (
  books: BookTypes.Entity[],
  currentIndex: number,
  offset: number,
) => {
  if (offset === 0) return
  const currentEntity = books.at(currentIndex)
  if (!currentEntity) return
  const uuid = currentEntity.uuid
  const targetIndex = currentIndex + offset
  if (targetIndex <= 0) return await booksMoveTopRouter.action({ uuid })
  const afterIndex = targetIndex < currentIndex ? targetIndex - 1 : targetIndex
  const afterBook = books.at(afterIndex)
  if (!afterBook) return
  await booksMoveAfterRouter.action({
    uuid,
    afterUuid: afterBook.uuid,
  })
}

function useRemoveBooks(reload: () => void) {
  const removeBooks = useCallback(
    (books: BookTypes.Entity[]) => {
      uiConfirm({
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
    [reload],
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
  activatedIndex,
  setActivatedIndex,
  setArchived,
  setFavorited,
  focusSearchInput,
  orderSelectPrev,
  orderSelectNext,
  setPage,
  dataBooks,
  selectTo,
  selectAll,
  selectedBooks,
  reload,
  moveBooksTop,
  removeBooks,
  hasOrder,
}: {
  activatedIndex: number
  setActivatedIndex: Dispatch<SetStateAction<number>>
  setArchived: Dispatch<SetStateAction<boolean>>
  setFavorited: Dispatch<SetStateAction<boolean>>
  focusSearchInput: () => void
  orderSelectPrev: () => void
  orderSelectNext: () => void
  setPage: Dispatch<SetStateAction<number>>
  dataBooks: BookPage | null | undefined
  selectTo: (index: number, shift: boolean) => void
  selectAll: () => void
  selectedBooks: BookTypes.Entity[]
  reload: () => void
  moveBooksTop: (books: BookTypes.Entity[]) => Promise<void>
  removeBooks: (books: BookTypes.Entity[]) => void
  hasOrder: boolean
}) {
  const [isPersonReplace] = usePersonReplace()
  const [speechSpeed] = useSpeechSpeed()
  const { getVoice } = useGetVoice()
  const { addHotkeys } = useHotkeys()
  const { openBookEdit } = useBookEditDialog(reload)
  const nav = useNavigate()

  const currentBook = useMemo(
    () => dataBooks?.items[activatedIndex],
    [activatedIndex, dataBooks],
  )

  const actionBooks = useMemo(
    () =>
      selectedBooks.length ? selectedBooks : currentBook ? [currentBook] : [],
    [currentBook, selectedBooks],
  )

  useEffect(() => {
    const count = dataBooks?.items.length ?? 0

    const goPrev = () => {
      setActivatedIndex((activatedIndex) =>
        activatedIndex > 0 ? activatedIndex - 1 : 0,
      )
    }

    const goTop = () => {
      setActivatedIndex(0)
    }

    const goNext = () => {
      setActivatedIndex((activatedIndex) =>
        activatedIndex < count - 1 ? activatedIndex + 1 : activatedIndex,
      )
    }

    const goBottom = () => {
      setActivatedIndex(count - 1)
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
      if (!currentBook || !dataBooks) return
      goPrev()
      await moveOffset(dataBooks.items, activatedIndex, -1)
      reload()
    }

    const moveNext = async () => {
      if (!currentBook || !dataBooks) return
      goNext()
      await moveOffset(dataBooks.items, activatedIndex, 1)
      reload()
    }

    const select = (shift: boolean) => {
      selectTo(activatedIndex, shift)
    }

    const removeBook = () => {
      if (currentBook) removeBooks(actionBooks)
    }

    const moveBookTop = () => {
      if (currentBook) void moveBooksTop(actionBooks)
    }

    const toggleListArchive = () => {
      setArchived((v) => !v)
    }

    const toggleListFavorite = () => {
      setFavorited((v) => !v)
    }

    const toggleArchive = () => {
      async(async () => {
        for (const book of actionBooks) {
          await booksUpdateRouter.action({
            uuid: book.uuid,
            update: {
              isArchived: !book.isArchived,
            },
          })
        }
        reload()
      })
    }

    const toggleFavorite = () => {
      async(async () => {
        for (const book of actionBooks) {
          await booksUpdateRouter.action({
            uuid: book.uuid,
            update: {
              isFavorited: !book.isFavorited,
            },
          })
        }
        reload()
      })
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

    const hotkeys: HotkeyItem[] = [
      ['k', t('hotkey.goPrev'), goPrev],
      ['j', t('hotkey.goNext'), goNext],
      ['ArrowUp', t('hotkey.goPrev'), goPrev],
      ['ArrowDown', t('hotkey.goNext'), goNext],
      ['h', t('hotkey.goPagePrev'), pagePrev],
      ['l', t('hotkey.goPageNext'), pageNext],
      ['ArrowLeft', t('hotkey.goPagePrev'), pagePrev],
      ['ArrowRight', t('hotkey.goPageNext'), pageNext],
      [
        ['s', { shift: true, key: 'E' }],
        t('hotkey.listArchive'),
        toggleListArchive,
      ],
      [['s', 'b'], t('hotkey.listFavorite'), toggleListFavorite],
      ['b', t('hotkey.favorite'), toggleFavorite],
      [{ shift: true, key: 'E' }, t('hotkey.archive'), toggleArchive],
      ['/', t('hotkey.search'), focusSearchInput],
      [['s', 's', 'n'], t('hotkey.sortOrder'), orderSelectNext],
      [['s', 's', 'p'], t('hotkey.sortOrder'), orderSelectPrev],
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
    ]

    if (!hasOrder)
      hotkeys.push(
        [{ ctrl: true, key: 'k' }, t('hotkey.goMovePrev'), movePrev],
        [{ ctrl: true, key: 'j' }, t('hotkey.goMoveNext'), moveNext],
        [{ ctrl: true, key: 'ArrowUp' }, t('hotkey.goMovePrev'), movePrev],
        [{ ctrl: true, key: 'ArrowDown' }, t('hotkey.goMoveNext'), moveNext],
      )

    return addHotkeys(hotkeys)
  }, [
    actionBooks,
    activatedIndex,
    addHotkeys,
    currentBook,
    dataBooks,
    focusSearchInput,
    getVoice,
    hasOrder,
    isPersonReplace,
    moveBooksTop,
    nav,
    openBookEdit,
    orderSelectNext,
    orderSelectPrev,
    reload,
    removeBooks,
    selectAll,
    selectTo,
    setActivatedIndex,
    setArchived,
    setFavorited,
    setPage,
    speechSpeed,
  ])
}

function BookButtons({
  book,
  reload,
}: {
  book: BookTypes.Entity
  reload: () => void
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { openBookEdit } = useBookEditDialog(reload)

  const exportBook = useCallback(() => {
    window.open(
      `${booksDownloadRouter.fullRoutePath}?uuid=${book.uuid}`,
      '_blank',
    )
  }, [book.uuid])

  const removeBooks = useRemoveBooks(reload)

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
        <MenuItem
          onClick={() => {
            async(async () => {
              await booksUpdateRouter.action({
                uuid: book.uuid,
                update: {
                  isArchived: !book.isArchived,
                },
              })
              reload()
            })
          }}
        >
          {book.isArchived ? t('unarchive') : t('archive')}
        </MenuItem>
        <MenuItem onClick={() => exportBook()}>{t('export')} Epub</MenuItem>
        <MenuItem
          onClick={() => {
            removeBooks([book])
          }}
        >
          {t('remove')}
        </MenuItem>
      </Menu>
    </>
  )
}

function BookRow({
  index,
  activated,
  book,
  books,
  onHoverMove,
  onDrop,
  onCancel,
  selectedUuids,
  selectTo,
  reload,
  hasOrder,
}: {
  index: number
  activated: boolean
  book: BookTypes.Entity
  books: BookTypes.Entity[]
  onHoverMove: (dragIndex: number, hoverIndex: number) => void
  onDrop: (item: DragItem) => void
  onCancel: () => void
  selectedUuids: string[]
  selectTo: (index: number, shift: boolean) => void
  reload: () => void
  hasOrder: boolean
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
    if (activated)
      refEl.current?.scrollIntoView({
        block: 'center',
      })
  }, [activated, drop])

  const [coverLoaded, setCoverLoaded] = useState(false)

  const coverUrl = `${getBooksCoverPath(book.uuid)}`

  const opacity = isDragging ? 0.2 : 1
  if (!hasOrder) drop(refEl)
  return (
    <TableRow ref={refEl} key={book.uuid} sx={{ opacity }} selected={activated}>
      <TableCell
        padding="none"
        ref={drag}
        sx={{
          cursor: 'move',
        }}
      >
        {!hasOrder && <DragIndicator />}
      </TableCell>
      <TableCell padding="none">
        <Checkbox
          checked={selectedUuids.includes(book.uuid)}
          onClick={(event) => {
            selectTo(index, event.shiftKey)
          }}
        ></Checkbox>
      </TableCell>
      <TableCell align="center" style={{ cursor: 'pointer' }}>
        {book.isFavorited ? (
          <Star
            onClick={() => {
              async(async () => {
                await booksUpdateRouter.action({
                  uuid: book.uuid,
                  update: {
                    isFavorited: false,
                  },
                })
                reload()
              })
            }}
          />
        ) : (
          <StarBorder
            onClick={() => {
              async(async () => {
                await booksUpdateRouter.action({
                  uuid: book.uuid,
                  update: {
                    isFavorited: true,
                  },
                })
                reload()
              })
            }}
          />
        )}
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
        <BookButtons book={book} reload={reload}></BookButtons>
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
  const { state } = useLocation()
  const locationInPage = state?.locationInPage as
    | BookTypes.LocationInPageState
    | undefined
  const theme = useTheme()
  const [page, setPage] = useState<number>(locationInPage?.page ?? 1)
  const [activatedIndex, setActivatedIndex] = useState(
    locationInPage?.index ?? 0,
  )
  const [archived, setArchived] = useState(false)
  const [favorited, setFavorited] = useState(false)

  const [search, setSearch] = useState<string>('')
  const searchDeferred = useSyncedDebounced(search, 500)
  const refSearchInput = useRef<HTMLInputElement | null>(null)

  const [order, setOrder] = useState<SortOrder>('default')
  const hasOrder = order !== 'default'

  const { data: dataBooks, reload } = useAction(
    booksPageRouter,
    {
      filter: {
        archive: archived ? 'archived' : 'active',
        favorite: favorited ? 'favorited' : 'all',
        search: searchDeferred,
        order,
      },
      page: { page },
    },
    {
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

  const focusSearchInput = useCallback(() => {
    if (refSearchInput.current) {
      refSearchInput.current.focus()
    }
  }, [])

  const orderSelectPrev = useCallback(() => {
    const i = sortOrders.indexOf(order)
    if (i > 0) setOrder(sortOrders[i - 1])
    else setOrder(sortOrders[sortOrders.length - 1])
  }, [order])

  const orderSelectNext = useCallback(() => {
    const i = sortOrders.indexOf(order)
    if (i < sortOrders.length - 1) setOrder(sortOrders[i + 1])
    else setOrder(sortOrders[0])
  }, [order])

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

  useHomeHotKeys({
    activatedIndex,
    setActivatedIndex,
    setArchived,
    setFavorited,
    focusSearchInput,
    orderSelectPrev,
    orderSelectNext,
    setPage,
    dataBooks,
    reload,
    selectTo,
    selectAll,
    selectedBooks,
    moveBooksTop,
    removeBooks,
    hasOrder,
  })

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
        if (!dataBooks) return
        setLoading(true)
        await moveOffset(
          dataBooks.items,
          item.startIndex,
          item.hoverIndex - item.startIndex,
        )
        reload()
        setLoading(false)
      })
    },
    [dataBooks, reload],
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

  // reset page & activatedIndex
  useEffect(() => {
    if (!books) return
    if (books.length <= 0) {
      if (page > 1) setPage(1)
    } else if (activatedIndex > books.length - 1) {
      setActivatedIndex(books.length - 1)
    }
  }, [activatedIndex, books, page])

  if (loading || !dataBooks || !books) return <SpinCenter />

  const Pager =
    dataBooks.pageCount > 1 ? (
      <Pagination
        sx={{ marginTop: 2 }}
        onChange={(_, page) => setPage(page)}
        page={page}
        count={dataBooks.pageCount}
      ></Pagination>
    ) : null

  return (
    <>
      <form>
        <FormControlLabel
          label={t('archive')}
          control={
            <Switch
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
          }
        ></FormControlLabel>
        <FormControlLabel
          label={t('favorite')}
          control={
            <Switch
              checked={favorited}
              onChange={(e) => setFavorited(e.target.checked)}
            />
          }
        ></FormControlLabel>
        <FormControlLabel
          label=""
          control={
            <TextField
              label={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              inputRef={refSearchInput}
              onKeyDown={(e) => {
                if (e.key === 'Escape') refSearchInput.current?.blur()
              }}
            />
          }
        ></FormControlLabel>
        <FormControlLabel
          label={t('sortOrder.label')}
          control={
            <Select
              value={order}
              onChange={(e) => setOrder(e.target.value as SortOrder)}
            >
              <MenuItem value="default">{t('sortOrder.item.default')}</MenuItem>
              <MenuItem value="reverse">{t('sortOrder.item.reverse')}</MenuItem>
              <MenuItem value="name">{t('sortOrder.item.name')}</MenuItem>
              <MenuItem value="name-reverse">
                {t('sortOrder.item.nameReverse')}
              </MenuItem>
            </Select>
          }
        ></FormControlLabel>
      </form>
      {books.length <= 0 ? (
        <Alert severity="warning">{t('prompt.noBooks')}</Alert>
      ) : (
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
                  <TableCell width="10px" padding="none">
                    <Checkbox
                      title={t('all')}
                      checked={allSelected}
                      onClick={() => {
                        selectAll()
                      }}
                    ></Checkbox>
                  </TableCell>
                  <TableCell width="10px">{t('favorite')}</TableCell>
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
                      activated={activatedIndex === index}
                      onHoverMove={onHoverMove}
                      onDrop={onDrop}
                      onCancel={onCancel}
                      selectTo={selectTo}
                      selectedUuids={selectedUuids}
                      reload={reload}
                      hasOrder={hasOrder}
                      key={book.uuid}
                    ></BookRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {Pager}
        </>
      )}
    </>
  )
}
