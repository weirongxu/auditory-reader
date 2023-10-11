import { t } from 'i18next'
import { useMemo } from 'react'
import type { BookNav, BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useViewPanelType } from '../../../../store.js'
import type { Player } from '../player.js'
import { useBookViewBookmarks } from './bookmarks.js'
import { useBookViewNav } from './nav.js'

export function useBookPanel(
  book: BookView,
  player: Player,
  activeNavs: BookNav[] | undefined,
  pos: BookTypes.PropertyPosition,
) {
  const [viewPanelType, setViewPanelType] = useViewPanelType()
  const { NavTreeView } = useBookViewNav(book, player, activeNavs)
  const { bookmarks, BookmarkView, toggleBookmark, activeBookmark } =
    useBookViewBookmarks(book, player, pos)

  const BookPanelView = useMemo(
    () => (
      <>
        <div
          className={[
            'book-panel',
            viewPanelType === 'none' ? 'hidden' : '',
          ].join(' ')}
        >
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
        <div
          className={[
            'book-panel-overlay',
            viewPanelType === 'none' ? 'hidden' : '',
          ].join(' ')}
          onClick={() => setViewPanelType('none')}
        ></div>
      </>
    ),

    [BookmarkView, NavTreeView, setViewPanelType, viewPanelType],
  )

  return useMemo(
    () => ({
      bookmarks,
      BookPanelView,
      setViewPanelType,
      toggleBookmark,
      activeBookmark,
    }),
    [
      bookmarks,
      BookPanelView,
      setViewPanelType,
      toggleBookmark,
      activeBookmark,
    ],
  )
}
