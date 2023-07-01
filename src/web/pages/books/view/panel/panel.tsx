import { useMemo } from 'react'
import type { BookViewRes } from '../../../../../core/api/books/view.js'
import type { BookNav } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useViewPanelType } from '../../../../store.js'
import type { Player } from '../player.js'
import { useBookViewBookmarks } from './bookmarks.js'
import { useBookViewNav } from './nav.js'
import { t } from 'i18next'

export function useBookPanel(
  book: BookViewRes,
  player: Player,
  activeNavs: BookNav[] | undefined,
  pos: BookTypes.PropertyPosition
) {
  const [viewPanelType, setViewPanelType] = useViewPanelType()
  const { NavTreeView } = useBookViewNav(book, player, activeNavs)
  const { BookmarkView, toggleBookmark, activeBookmark } = useBookViewBookmarks(
    book,
    player,
    pos
  )

  const BookPanelView = useMemo(
    () =>
      viewPanelType !== 'none' ? (
        <div className="book-panel">
          {viewPanelType === 'nav' && (
            <>
              <h3>{t('nav')}</h3>
              {NavTreeView}
            </>
          )}
          {viewPanelType === 'bookmark' && (
            <>
              <h3>{t('bookmark')}</h3>
              {BookmarkView}
            </>
          )}
        </div>
      ) : null,

    [BookmarkView, NavTreeView, viewPanelType]
  )

  return useMemo(
    () => ({ BookPanelView, setViewPanelType, toggleBookmark, activeBookmark }),
    [BookPanelView, setViewPanelType, toggleBookmark, activeBookmark]
  )
}
