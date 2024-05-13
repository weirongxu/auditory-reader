import { t } from 'i18next'
import { useMemo } from 'react'
import type { BookNav, BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useViewPanelType } from '../../../../store.js'
import type { Player } from '../player.js'
import { useBookViewAnnotations } from './annotations.js'
import { useBookViewBookmarks } from './bookmarks.js'
import { useBookViewNav } from './nav.js'

export function useBookPanel(
  book: BookView,
  player: Player,
  activeNavs: BookNav[] | undefined,
  pos: BookTypes.PropertyPosition,
  selection: BookTypes.PropertyBookmarkRange | undefined,
) {
  const [viewPanelType, setViewPanelType] = useViewPanelType()
  const { NavTreeView } = useBookViewNav(book, player, activeNavs)
  const { bookmarks, BookmarkView, activeBookmark } = useBookViewBookmarks(
    book,
    player,
    pos,
    selection,
  )
  const { annotations, AnnotationView, activeAnnotation } =
    useBookViewAnnotations(book, player, pos, selection)

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
          {viewPanelType === 'annotation' && (
            <>
              <h3>{t('annotation')}</h3>
              {AnnotationView}
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
    [
      AnnotationView,
      BookmarkView,
      NavTreeView,
      setViewPanelType,
      viewPanelType,
    ],
  )

  return useMemo(
    () => ({
      bookmarks,
      activeBookmark,
      annotations,
      activeAnnotation,
      setViewPanelType,
      BookPanelView,
    }),
    [
      bookmarks,
      activeBookmark,
      annotations,
      activeAnnotation,
      setViewPanelType,
      BookPanelView,
    ],
  )
}
