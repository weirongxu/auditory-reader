import { faEllipsisVertical, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'antd'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { booksBookmarksRouter } from '../../../../../core/api/books/bookmarks.js'
import type { BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { isMobile } from '../../../../../core/util/browser.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { textEllispse } from '../../../../../core/util/text.js'
import { SwipeAction } from '../../../../common/swipe-action.js'
import { Icon } from '../../../../components/icon.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import type { Player } from '../player.js'

function BookmarkItem({
  bookmark,
  isSelected,
  isActivated,
  player,
}: {
  bookmark: BookTypes.PropertyBookmark
  isSelected: boolean
  isActivated: boolean
  player: Player
}) {
  const textCls: string[] = ['text', 'clickable']
  if (isActivated) textCls.push('active')
  if (isSelected) textCls.push('selected')

  return (
    <li
      data-pos-section={bookmark.section}
      data-pos-paragraph={bookmark.paragraph}
    >
      <SwipeAction
        right={{
          node: <Icon icon={faTrash} size="sm" />,
          width: 30,
          trigger: () => {
            void player.bookmarks.removeBookmark(bookmark)
          },
        }}
      >
        <div className="item">
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
            {bookmark.note && (
              <div className="note">
                note: {textEllispse(bookmark.note, 30)}
              </div>
            )}
          </div>
          {!isMobile && (
            <>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'remove',
                      label: t('remove'),
                      onClick: () =>
                        void player.bookmarks.removeBookmark(bookmark),
                    },
                  ],
                }}
                trigger={['click']}
              >
                <div className="btn">
                  <Icon icon={faEllipsisVertical} />
                </div>
              </Dropdown>
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
}: {
  bookmarks: BookTypes.PropertyBookmark[] | undefined | null
  activeBookmarkIndex: number | undefined
  player: Player
}) {
  const { addHotkeys } = useHotkeys()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const refBookmark = useRef<HTMLDivElement>(null)

  const selectedBookmark = useMemo(() => {
    return bookmarks?.at(selectedIndex)
  }, [bookmarks, selectedIndex])

  const removeSelectedBookmark = useCallback(async () => {
    if (selectedBookmark)
      await player.bookmarks.removeBookmark(selectedBookmark)
  }, [player.bookmarks, selectedBookmark])

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

  return (
    <div className="panel-content book-bookmarks" ref={refBookmark}>
      {!bookmarks?.length ? (
        t('desc.bookmarksEmpty')
      ) : (
        <ul>
          {bookmarks.map((bookmark, idx) => (
            <BookmarkItem
              key={idx}
              bookmark={bookmark}
              isActivated={activeBookmarkIndex === idx}
              isSelected={selectedIndex === idx}
              player={player}
            ></BookmarkItem>
          ))}
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
  const { data: bookmarks, reload } = useAction(
    booksBookmarksRouter,
    {
      uuid,
    },
    {
      clearWhenReload: false,
    },
  )

  useEffect(() => {
    player.bookmarks.reload = reload
    return () => {
      player.bookmarks.reload = undefined
    }
  }, [player.bookmarks, reload])

  useEffect(() => {
    player.annotations.reload = reload
    return () => {
      player.annotations.reload = undefined
    }
  }, [player.annotations, reload])

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

  return {
    bookmarks,
    BookmarkView: (
      <Bookmarks
        bookmarks={bookmarks}
        activeBookmarkIndex={activeBookmarkIndex}
        player={player}
      ></Bookmarks>
    ),
    activeBookmark,
  }
}
