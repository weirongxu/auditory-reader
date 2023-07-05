import { Delete } from '@mui/icons-material'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { booksAddBookmarksRouter } from '../../../../../core/api/books/add-bookmarks.js'
import { booksBookmarksRouter } from '../../../../../core/api/books/bookmarks.js'
import { booksDeleteBookmarksRouter } from '../../../../../core/api/books/delete-bookmarks.js'
import type { BookViewRes } from '../../../../../core/api/books/view.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { pushSnackbar } from '../../../../common/snackbar.js'
import type { Player } from '../player.js'

function Bookmarks(props: {
  bookmarks: BookTypes.PropertyBookmark[] | undefined | null
  activeBookmark: BookTypes.PropertyBookmark | undefined
  pos: BookTypes.PropertyPosition
  player: Player
  removeBookmark: (bookmark: BookTypes.PropertyBookmark) => void
}) {
  const { bookmarks, activeBookmark, pos, player, removeBookmark } = props
  const refBookmark = useRef<HTMLDivElement>(null)

  // scroll to first active bookmark
  useEffect(() => {
    if (!activeBookmark) return
    const bookmarkDiv = refBookmark.current
    if (!bookmarkDiv) return
    const fristBookmarkDiv = [
      ...bookmarkDiv.querySelectorAll('div.text.active-whole'),
    ].at(0)
    fristBookmarkDiv?.scrollIntoView({
      block: 'center',
    })
  }, [activeBookmark])

  return (
    <div className="panel-content book-bookmarks" ref={refBookmark}>
      {!bookmarks?.length ? (
        t('desc.bookmarksEmpty')
      ) : (
        <ul>
          {bookmarks.map((bookmark, idx) => {
            const isActive = bookmark.section === pos.section
            const isActiveWhole =
              isActive && bookmark.paragraph === pos.paragraph
            const textCls: string[] = ['text', 'clickable']
            if (isActive) textCls.push('active')
            if (isActiveWhole) textCls.push('active-whole')
            return (
              <li
                key={idx}
                data-pos-section={bookmark.section}
                data-pos-paragraph={bookmark.paragraph}
              >
                <div className="item">
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
  book: BookViewRes,
  player: Player,
  pos: BookTypes.PropertyPosition
) {
  const uuid = book.item.uuid
  const { data: bookmarks, reload } = useAction(booksBookmarksRouter, {
    uuid,
  })

  const activeBookmark = useMemo(
    () =>
      bookmarks?.find(
        (b) => b.section === pos.section && b.paragraph === pos.paragraph
      ),
    [bookmarks, pos.paragraph, pos.section]
  )

  const addBookmark = useCallback(() => {
    const node = player.iframeCtrler.readableParts[pos.paragraph]
    if (!node) return
    if (node.type !== 'text')
      return pushSnackbar({
        severity: 'error',
        message: t('desc.noSuportedBookmark'),
      })
    const brief = node.text.slice(0, 20)
    booksAddBookmarksRouter
      .action({
        bookmarks: [
          {
            brief,
            type: 'text',
            section: pos.section,
            paragraph: pos.paragraph,
          },
        ],
        uuid,
      })
      .then(() => {
        reload()
        return pushSnackbar({
          message: `${t('desc.addedBookmark')} ${brief}`,
        })
      })
      .catch(console.error)
  }, [
    player.iframeCtrler.readableParts,
    pos.paragraph,
    pos.section,
    reload,
    uuid,
  ])

  const removeBookmark = useCallback(
    (bookmark: BookTypes.PropertyBookmark) => {
      booksDeleteBookmarksRouter
        .action({
          uuid,
          bookmarkUuids: [bookmark.uuid],
        })
        .then(() => {
          reload()
          return pushSnackbar({
            message: `${t('desc.deletedBookmark')} ${bookmark.brief}`,
          })
        })
        .catch(console.error)
    },
    [reload, uuid]
  )

  const toggleBookmark = useCallback(() => {
    if (activeBookmark) {
      removeBookmark(activeBookmark)
    } else {
      addBookmark()
    }
  }, [addBookmark, activeBookmark, removeBookmark])

  return {
    BookmarkView: (
      <Bookmarks
        bookmarks={bookmarks}
        activeBookmark={activeBookmark}
        player={player}
        pos={pos}
        removeBookmark={removeBookmark}
      ></Bookmarks>
    ),
    toggleBookmark,
    activeBookmark,
  }
}
