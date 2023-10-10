import { ChevronRight, Delete } from '@mui/icons-material'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { booksBookmarksRouter } from '../../../../../core/api/books/bookmarks.js'
import type { BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import type { Player } from '../player.js'

function Bookmarks({
  bookmarks,
  activeBookmarkIndex,
  player,
  removeBookmark,
}: {
  bookmarks: BookTypes.PropertyBookmark[] | undefined | null
  activeBookmarkIndex: number | undefined
  player: Player
  removeBookmark: (bookmark: BookTypes.PropertyBookmark) => void
}) {
  const { addHotkeys } = useHotkeys()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const refBookmark = useRef<HTMLDivElement>(null)

  const selectedBookmark = useMemo(() => {
    return bookmarks?.at(selectedIndex)
  }, [bookmarks, selectedIndex])

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

    return addHotkeys([
      ['p', t('hotkey.prevBookmark'), prevBookmark],
      ['n', t('hotkey.nextBookmark'), nextBookmark],
      ['enter', t('hotkey.gotoBookmark'), gotoBookmark],
      [{ shift: true, key: 'K' }, t('hotkey.speakBookmark'), speakBookmark],
    ])
  }, [addHotkeys, bookmarks, player, selectedBookmark, selectedIndex])

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

  return (
    <div className="panel-content book-bookmarks" ref={refBookmark}>
      {!bookmarks?.length ? (
        t('desc.bookmarksEmpty')
      ) : (
        <ul>
          {bookmarks.map((bookmark, idx) => {
            const isSelected = selectedIndex === idx
            const isActived = activeBookmarkIndex === idx
            const textCls: string[] = ['text', 'clickable']
            if (isActived) textCls.push('active')
            if (isSelected) textCls.push('selected')
            return (
              <li
                key={idx}
                data-pos-section={bookmark.section}
                data-pos-paragraph={bookmark.paragraph}
              >
                <div className="item">
                  {isSelected && <ChevronRight className="selected-icon" />}
                  <div
                    className={textCls.join(' ')}
                    onClick={(event) => {
                      event.stopPropagation()
                      player
                        .gotoSection(bookmark.section, bookmark.paragraph)
                        .catch(console.error)
                    }}
                  >
                    {bookmark.brief}
                  </div>
                  <div className="btns">
                    <div
                      className="btn"
                      onClick={() => {
                        removeBookmark(bookmark)
                      }}
                    >
                      <Delete />
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
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
        removeBookmark={removeBookmark}
      ></Bookmarks>
    ),
    toggleBookmark,
    activeBookmark,
  }
}
