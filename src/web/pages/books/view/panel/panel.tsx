import { t } from 'i18next'
import { useMemo } from 'react'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useViewPanelType } from '../../../../store.js'
import type { BookView } from '../../view.js'
import type { Player } from '../player.js'
import { useBookViewAnnotations } from './annotations.js'
import { useBookViewKeywords } from './keywords.js'
import { useBookViewNav } from './nav.js'

export function useBookPanel(
  book: BookView,
  player: Player,
  activeNavs: BookTypes.Nav[] | undefined,
  pos: BookTypes.PropertyPosition,
  selection: BookTypes.PropertyRange | undefined,
) {
  const [viewPanelType, setViewPanelType] = useViewPanelType()
  const { NavTreeView } = useBookViewNav(book, player, activeNavs)
  const { annotations, AnnotationView } = useBookViewAnnotations(
    book,
    player,
    pos,
    selection,
  )
  const { keywords, KeywordView } = useBookViewKeywords(book, player)

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
          {viewPanelType === 'annotation' && (
            <>
              <h3>{t('annotation')}</h3>
              {AnnotationView}
            </>
          )}
          {viewPanelType === 'keyword' && (
            <>
              <h3>{t('keyword')}</h3>
              {KeywordView}
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
    [AnnotationView, KeywordView, NavTreeView, setViewPanelType, viewPanelType],
  )

  return useMemo(
    () => ({
      annotations,
      keywords,
      setViewPanelType,
      BookPanelView,
    }),
    [annotations, keywords, setViewPanelType, BookPanelView],
  )
}
