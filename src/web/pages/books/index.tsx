import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import {
  faAdd,
  faEllipsisVertical,
  faGripVertical,
  faStar,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import {
  Alert,
  Button,
  Checkbox,
  Dropdown,
  Form,
  Input,
  Pagination,
  Select,
  Space,
  Switch,
  Tag,
  type InputRef,
} from 'antd'
import { t } from 'i18next'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useNavigate } from 'react-router-dom'
import { getBooksCoverPath } from '../../../core/api/books/cover.js'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksMoveAfterRouter } from '../../../core/api/books/move-after.js'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import type { BookPage } from '../../../core/api/books/page.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import { booksUpdateRouter } from '../../../core/api/books/update.js'
import { sortOrders } from '../../../core/book/enums.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useAction } from '../../../core/route/action.js'
import { filterOptionLabel } from '../../../core/util/antd.js'
import { async } from '../../../core/util/promise.js'
import { Speech } from '../../../core/util/speech.js'
import { uiConfirm } from '../../common/confirm.js'
import { previewImgSrcAtom } from '../../common/preview-image.js'
import { Icon } from '../../components/icon.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { SpinCenter } from '../../components/spin.js'
import { useSyncedDebounced } from '../../hooks/use-synced-debounce.js'
import { useHotkeys, type HotkeyItem } from '../../hotkey/hotkey-state.js'
import { useGetVoice, usePersonReplace, useSpeechSpeed } from '../../store.js'
import { globalStore } from '../../store/global.js'
import { useAppBarSync } from '../layout/use-app-bar.js'
import {
  activatedIndexAtom,
  archivedAtom,
  favoritedAtom,
  orderAtom,
  perPageAtom,
  searchAtom,
  usePage,
} from './index-atoms.js'
import { useBookEditDialog } from './edit.js'
import * as styles from './index.module.scss'

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
      async(async () => {
        if (
          await uiConfirm({
            title: t('remove'),
            description: (
              <ul>
                {books.map((book) => (
                  <li key={book.uuid}>{book.name}</li>
                ))}
              </ul>
            ),
          })
        ) {
          for (const book of books) {
            await booksRemoveRouter.action({
              uuid: book.uuid,
            })
          }
          reload()
        }
      })
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
  focusSearchInput,
  orderSelectPrev,
  orderSelectNext,
  dataBooks,
  selectTo,
  selectAll,
  selectedBooks,
  reload,
  moveBooksTop,
  removeBooks,
  hasOrder,
}: {
  focusSearchInput: () => void
  orderSelectPrev: () => void
  orderSelectNext: () => void
  dataBooks: BookPage | null | undefined
  selectTo: (index: number, shift: boolean) => void
  selectAll: () => void
  selectedBooks: BookTypes.Entity[]
  reload: () => void
  moveBooksTop: (books: BookTypes.Entity[]) => Promise<void>
  removeBooks: (books: BookTypes.Entity[]) => void
  hasOrder: boolean
}) {
  const [activatedIndex, setActivatedIndex] = useAtom(activatedIndexAtom)
  const [, setPage] = usePage()
  const [, setArchived] = useAtom(archivedAtom)
  const [, setFavorited] = useAtom(favoritedAtom)
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
      }
    }

    const pageFirst = () => {
      if (dataBooks) setPage(1)
    }

    const pageNext = () => {
      if (dataBooks) {
        setPage((page) => (page < dataBooks.pageCount ? page + 1 : 1))
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
  const { openBookEdit } = useBookEditDialog(reload)

  const exportBook = useCallback(() => {
    window.open(
      `${booksDownloadRouter.fullRoutePath}?uuid=${book.uuid}`,
      '_blank',
    )
  }, [book.uuid])

  const removeBooks = useRemoveBooks(reload)

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          {
            key: 'edit',
            label: t('edit'),
            onClick: () => openBookEdit(book.uuid),
          },
          {
            key: 'archive',
            label: book.isArchived ? t('unarchive') : t('archive'),
            onClick: () => {
              async(async () => {
                await booksUpdateRouter.action({
                  uuid: book.uuid,
                  update: {
                    isArchived: !book.isArchived,
                  },
                })
                reload()
              })
            },
          },
          {
            key: 'export',
            label: `${t('export')} Epub`,
            onClick: () => exportBook(),
          },
          {
            key: 'remove',
            label: t('remove'),
            onClick: () => removeBooks([book]),
          },
        ],
      }}
    >
      <Button shape="circle" type="text">
        <Icon icon={faEllipsisVertical} />
      </Button>
    </Dropdown>
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
  const [, setActivatedIndex] = useAtom(activatedIndexAtom)
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
    <tr
      ref={refEl}
      key={book.uuid}
      style={{
        opacity,
        background: activated ? 'var(--main-bg-active)' : 'var(--main-bg)',
      }}
    >
      <td
        ref={drag}
        style={{
          cursor: 'move',
        }}
      >
        {!hasOrder && (
          <Icon size="lg" icon={faGripVertical} style={{ marginLeft: 4 }} />
        )}
      </td>
      <td>
        <Checkbox
          checked={selectedUuids.includes(book.uuid)}
          onClick={(event) => {
            selectTo(index, event.shiftKey)
          }}
        ></Checkbox>
      </td>
      <td align="center" style={{ cursor: 'pointer' }}>
        {book.isFavorited ? (
          <Icon
            icon={faStar}
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
          <Icon
            icon={faStarRegular}
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
      </td>
      <td>
        <div className="cell-center">
          <img
            onClick={() => {
              globalStore.set(previewImgSrcAtom, coverUrl)
            }}
            onLoad={() => {
              setCoverLoaded(true)
            }}
            style={{
              visibility: coverLoaded ? 'visible' : 'hidden',
              cursor: 'pointer',
            }}
            src={coverUrl}
            alt={`${book.name} ${t('cover')}`}
          />
        </div>
      </td>
      <td
        className={styles.hover}
        title={book.createdAt.toLocaleString()}
        onClick={() => {
          setActivatedIndex(index)
          nav(viewPath(book.uuid))
        }}
      >
        {book.name}
      </td>
      <td>
        <BookButtons book={book} reload={reload}></BookButtons>
      </td>
    </tr>
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
    <Tag
      ref={drop}
      color={isOver ? 'error' : 'warning'}
      icon={isOver ? <Icon icon={faTrash} /> : null}
    >
      {t('prompt.dropHereToRemove')}
    </Tag>
  )
}

export function BookList() {
  const [page, setPage] = usePage()
  const [perPage, setPerPage] = useAtom(perPageAtom)
  const [activatedIndex, setActivatedIndex] = useAtom(activatedIndexAtom)
  const [archived, setArchived] = useAtom(archivedAtom)
  const [favorited, setFavorited] = useAtom(favoritedAtom)

  const [search, setSearch] = useAtom(searchAtom)
  const searchDeferred = useSyncedDebounced(search, 500)
  const refSearchInput = useRef<InputRef | null>(null)

  const [order, setOrder] = useAtom(orderAtom)
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
      page: { page, perPage },
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
    const prevOrder = sortOrders[i - 1]
    if (prevOrder) setOrder(prevOrder)
    else {
      const lastOrder = sortOrders[sortOrders.length - 1]
      if (lastOrder) setOrder(lastOrder)
    }
  }, [order, setOrder])

  const orderSelectNext = useCallback(() => {
    const i = sortOrders.indexOf(order)
    const nextOrder = sortOrders[i + 1]
    if (nextOrder) setOrder(nextOrder)
    else setOrder(sortOrders[0])
  }, [order, setOrder])

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
    [reload, setPage],
  )

  useHomeHotKeys({
    focusSearchInput,
    orderSelectPrev,
    orderSelectNext,
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
      if (entityJson) newBooks.splice(hoverIndex, 0, entityJson)
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
        <Button.Group>
          <Button
            type="primary"
            size="small"
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
            type="primary"
            size="small"
            danger
            onClick={() => {
              removeBooks(selectedBooks)
            }}
          >
            {t('remove')}
          </Button>
        </Button.Group>
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
          <Button type="text" shape="circle" href={href} title={t('add')}>
            <Icon icon={faAdd} />
          </Button>
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
  }, [activatedIndex, books, page, setActivatedIndex, setPage])

  if (loading || !dataBooks || !books) return <SpinCenter />

  const Pager =
    dataBooks.pageCount > 1 ? (
      <Pagination
        onChange={(page) => setPage(page)}
        pageSize={perPage}
        onShowSizeChange={(_, size) => setPerPage(size)}
        current={page}
        total={dataBooks.count}
      ></Pagination>
    ) : null

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form layout="inline">
          <Form.Item label={t('archive')}>
            <Switch checked={archived} onChange={(v) => setArchived(v)} />
          </Form.Item>
          <Form.Item label={t('favorite')}>
            <Switch checked={favorited} onChange={(v) => setFavorited(v)} />
          </Form.Item>
          <Form.Item label={t('search')}>
            <Input
              value={search}
              placeholder={t('search')}
              onChange={(e) => setSearch(e.target.value)}
              ref={refSearchInput}
              onKeyDown={(e) => {
                if (e.key === 'Escape') refSearchInput.current?.blur()
              }}
            ></Input>
          </Form.Item>
          <Form.Item label={t('sortOrder.label')}>
            <Select
              showSearch
              filterOption={filterOptionLabel}
              popupMatchSelectWidth={false}
              value={order}
              onChange={(v) => setOrder(v)}
              options={[
                {
                  label: t('sortOrder.item.default'),
                  value: 'default',
                },
                {
                  label: t('sortOrder.item.reverse'),
                  value: 'reverse',
                },
                {
                  label: t('sortOrder.item.name'),
                  value: 'name',
                },
                {
                  label: t('sortOrder.item.nameReverse'),
                  value: 'name-reverse',
                },
              ]}
            ></Select>
          </Form.Item>
        </Form>
        {books.length <= 0 ? (
          <Alert type="warning" message={t('prompt.noBooks')}></Alert>
        ) : (
          <>
            {Pager}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <Checkbox
                      title={t('all')}
                      checked={allSelected}
                      onClick={() => {
                        selectAll()
                      }}
                    ></Checkbox>
                  </th>
                  <th>{t('favorite')}</th>
                  <th>{t('cover')}</th>
                  <th>{t('bookName')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
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
              </tbody>
            </table>
            {Pager}
          </>
        )}
      </Space>
    </>
  )
}
