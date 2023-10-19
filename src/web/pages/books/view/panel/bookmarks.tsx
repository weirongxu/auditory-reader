import {
  ChevronRight,
  Delete,
  MoreVert,
  StickyNote2,
} from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  TextareaAutosize,
  Typography,
} from '@mui/material'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { booksBookmarksRouter } from '../../../../../core/api/books/bookmarks.js'
import type { BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { isMobile } from '../../../../../core/util/browser.js'
import { SwipeAction } from '../../../../common/swipe-action.js'
import { FlexBox } from '../../../../components/flex-box.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import type { Player } from '../player.js'
import { textEllispse } from '../../../../../core/util/text.js'
import { eventBan } from '../../../../../core/util/dom.js'

function BookmarkItem({
  bookmark,
  isSelected,
  isActived,
  player,
  openNote,
  removeBookmark,
}: {
  bookmark: BookTypes.PropertyBookmark
  isSelected: boolean
  isActived: boolean
  player: Player
  openNote: () => void
  removeBookmark: () => void
}) {
  const [anchorMenu, setAnchorMenu] = useState<HTMLDivElement | null>(null)

  const textCls: string[] = ['text', 'clickable']
  if (isActived) textCls.push('active')
  if (isSelected) textCls.push('selected')

  return (
    <li
      data-pos-section={bookmark.section}
      data-pos-paragraph={bookmark.paragraph}
    >
      <SwipeAction
        left={{
          node: <StickyNote2 fontSize="small" />,
          width: 30,
          trigger: () => {
            openNote()
          },
        }}
        right={{
          node: <Delete fontSize="small" />,
          width: 30,
          trigger: () => {
            removeBookmark()
          },
        }}
      >
        <div className="item">
          {isSelected && !isMobile && (
            <ChevronRight className="selected-icon" />
          )}
          <div
            className={textCls.join(' ')}
            style={{ fontSize: 13 }}
            onClick={(event) => {
              eventBan(event)
              player
                .gotoSection(bookmark.section, bookmark.paragraph)
                .catch(console.error)
            }}
          >
            {bookmark.brief}
            <div className="note">{textEllispse(bookmark.note, 30)}</div>
          </div>
          {!isMobile && (
            <>
              <div
                className="btn"
                onClick={(event) => {
                  setAnchorMenu(event.currentTarget)
                }}
              >
                <MoreVert></MoreVert>
              </div>
              <Menu
                open={Boolean(anchorMenu)}
                anchorEl={anchorMenu}
                onClose={() => setAnchorMenu(null)}
              >
                <MenuItem onClick={() => openNote()}>{t('note')}</MenuItem>
                <MenuItem onClick={() => removeBookmark()}>
                  {t('remove')}
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </SwipeAction>
    </li>
  )
}

function Bookmarks({
  bookmarks,
  activeBookmarkIndex,
  player,
  updateBookmark,
  removeBookmark,
}: {
  bookmarks: BookTypes.PropertyBookmark[] | undefined | null
  activeBookmarkIndex: number | undefined
  player: Player
  updateBookmark: (bookmark: BookTypes.PropertyBookmark) => void
  removeBookmark: (bookmark: BookTypes.PropertyBookmark) => void
}) {
  const { addHotkeys } = useHotkeys()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [bookmarkForNote, setBookmarkForNote] =
    useState<BookTypes.PropertyBookmark>()
  const refBookmark = useRef<HTMLDivElement>(null)

  const openNote = useCallback((bookmark: BookTypes.PropertyBookmark) => {
    setBookmarkForNote({ ...bookmark })
  }, [])

  const selectedBookmark = useMemo(() => {
    return bookmarks?.at(selectedIndex)
  }, [bookmarks, selectedIndex])

  const removeSelectedBookmark = useCallback(() => {
    if (selectedBookmark) removeBookmark(selectedBookmark)
  }, [removeBookmark, selectedBookmark])

  // selected hotkeys
  useEffect(() => {
    const prevBookmark = () => {
      setSelectedIndex((idx) => (idx <= 0 ? 0 : idx - 1))
    }
    const nextBookmark = () => {
      bookmarks &&
        setSelectedIndex((idx) =>
          idx >= bookmarks.length - 1 ? bookmarks.length - 1 : idx + 1,
        )
    }
    const gotoBookmark = () => {
      const selectedBookmark = bookmarks?.[selectedIndex]
      if (!selectedBookmark) return
      player
        .gotoSection(selectedBookmark.section, selectedBookmark.paragraph)
        .catch(console.error)
    }
    const speakBookmark = () => {
      if (!selectedBookmark) return
      player.utterer.speakText(selectedBookmark.brief).catch(console.error)
    }

    const noteBookmark = () => {
      if (!selectedBookmark) return
      openNote(selectedBookmark)
    }

    return addHotkeys([
      ['p', t('hotkey.prevBookmark'), prevBookmark],
      ['n', t('hotkey.nextBookmark'), nextBookmark],
      ['enter', t('hotkey.gotoBookmark'), gotoBookmark],
      [
        { shift: true, key: 'M' },
        t('hotkey.bookmarkNoteSelected'),
        () => noteBookmark(),
      ],
      [
        ['d', 'b'],
        t('hotkey.bookmarkRemoveSelected'),
        () => removeSelectedBookmark(),
      ],
      [{ shift: true, key: 'K' }, t('hotkey.speakBookmark'), speakBookmark],
    ])
  }, [
    addHotkeys,
    bookmarks,
    openNote,
    player,
    removeSelectedBookmark,
    selectedBookmark,
    selectedIndex,
  ])

  // change selected bookmark
  useEffect(() => {
    if (activeBookmarkIndex === undefined) return
    setSelectedIndex(activeBookmarkIndex)
  }, [activeBookmarkIndex])

  // scroll to selected bookmark
  useEffect(() => {
    if (!selectedBookmark) return
    const bookmarkDiv = refBookmark.current
    if (!bookmarkDiv) return
    const selectedBookmarkDiv = bookmarkDiv.querySelector('div.text.selected')
    selectedBookmarkDiv?.scrollIntoView({
      block: 'center',
    })
  }, [selectedBookmark])

  const submitNote = useCallback(() => {
    if (bookmarkForNote) updateBookmark(bookmarkForNote)
    setBookmarkForNote(undefined)
  }, [bookmarkForNote, updateBookmark])

  return (
    <div className="panel-content book-bookmarks" ref={refBookmark}>
      {!bookmarks?.length ? (
        t('desc.bookmarksEmpty')
      ) : (
        <>
          <Dialog
            open={bookmarkForNote !== undefined}
            onClose={() => setBookmarkForNote(undefined)}
            fullWidth
            PaperProps={{
              style: {
                alignItems: 'start',
              },
            }}
          >
            <DialogTitle>
              {t('bookmark')} {t('note')}
            </DialogTitle>
            <DialogContent style={{ width: '100%' }}>
              <Typography>{bookmarkForNote?.brief}</Typography>
              <form
                onSubmit={(e) => {
                  eventBan(e)
                  submitNote()
                }}
              >
                <FlexBox gap={8}>
                  <TextareaAutosize
                    minRows={3}
                    autoFocus
                    value={bookmarkForNote?.note}
                    onChange={(e) =>
                      setBookmarkForNote((b) => {
                        if (!b) return
                        return {
                          ...b,
                          note: e.target.value,
                        }
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        eventBan(e)
                        submitNote()
                      }
                    }}
                  ></TextareaAutosize>
                  <Button type="submit">{t('update')}</Button>
                </FlexBox>
              </form>
            </DialogContent>
          </Dialog>
          <ul>
            {bookmarks.map((bookmark, idx) => (
              <BookmarkItem
                key={idx}
                bookmark={bookmark}
                isActived={activeBookmarkIndex === idx}
                isSelected={selectedIndex === idx}
                openNote={() => openNote(bookmark)}
                removeBookmark={() => removeBookmark(bookmark)}
                player={player}
              ></BookmarkItem>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export function useBookViewBookmarks(
  book: BookView,
  player: Player,
  pos: BookTypes.PropertyPosition,
) {
  const uuid = book.item.uuid
  const { data: bookmarks, reload } = useAction(booksBookmarksRouter, {
    uuid,
  })

  useEffect(() => {
    player.bookmarks.reload = reload
    return () => {
      player.bookmarks.reload = undefined
    }
  }, [player.bookmarks, reload])

  const activeBookmarkIndex = useMemo(() => {
    const idx = bookmarks?.findIndex(
      (b) => b.section === pos.section && b.paragraph === pos.paragraph,
    )
    return idx === -1 ? undefined : idx
  }, [bookmarks, pos.paragraph, pos.section])

  const activeBookmark = useMemo(
    () =>
      activeBookmarkIndex !== undefined
        ? bookmarks?.[activeBookmarkIndex]
        : undefined,
    [bookmarks, activeBookmarkIndex],
  )

  const addBookmark = useCallback(() => {
    player.bookmarks.addBookmark(pos).catch(console.error)
  }, [player.bookmarks, pos])

  const updateBookmark = useCallback(
    (bookmark: BookTypes.PropertyBookmark) => {
      player.bookmarks.updateBookmark(bookmark).catch(console.error)
    },
    [player.bookmarks],
  )

  const removeBookmark = useCallback(
    (bookmark: BookTypes.PropertyBookmark) => {
      player.bookmarks.removeBookmark(bookmark).catch(console.error)
    },
    [player.bookmarks],
  )

  const toggleBookmark = useCallback(() => {
    if (activeBookmark) {
      removeBookmark(activeBookmark)
    } else {
      addBookmark()
    }
  }, [addBookmark, activeBookmark, removeBookmark])

  return {
    bookmarks,
    BookmarkView: (
      <Bookmarks
        bookmarks={bookmarks}
        activeBookmarkIndex={activeBookmarkIndex}
        player={player}
        updateBookmark={updateBookmark}
        removeBookmark={removeBookmark}
      ></Bookmarks>
    ),
    toggleBookmark,
    activeBookmark,
  }
}
