import {
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { useMemo } from 'react'
import type { BookTypes } from '../../../../../core/book/types.js'
import { Icon } from '../../../../components/icon.js'
import { usePanelExpanded, useViewPanelType } from '../../../../store.js'
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
  const [panelExpanded, setPanelExpanded] = usePanelExpanded()
  const { NavTreeView } = useBookViewNav(book, player, activeNavs)
  const { annotations, AnnotationView } = useBookViewAnnotations(
    book,
    player,
    pos,
    selection,
  )
  const { keywords, KeywordView } = useBookViewKeywords(book, player)

  const toggleExpanded = useMemo(
    () => () => setPanelExpanded((v) => !v),
    [setPanelExpanded],
  )

  const ExpandIcon = useMemo(
    () => (
      <Icon
        icon={
          panelExpanded
            ? faDownLeftAndUpRightToCenter
            : faUpRightAndDownLeftFromCenter
        }
        size="sm"
        onClick={toggleExpanded}
      />
    ),
    [panelExpanded, toggleExpanded],
  )

  const BookPanelView = useMemo(
    () => (
      <>
        <div
          className={[
            'book-panel',
            viewPanelType === 'none' ? 'hidden' : '',
            panelExpanded ? 'expanded' : '',
          ].join(' ')}
        >
          {viewPanelType === 'nav' && (
            <>
              <h3>
                {t('nav')} {ExpandIcon}
              </h3>
              {NavTreeView}
            </>
          )}
          {viewPanelType === 'annotation' && (
            <>
              <h3>
                {t('annotation')} {ExpandIcon}
              </h3>
              {AnnotationView}
            </>
          )}
          {viewPanelType === 'keyword' && (
            <>
              <h3>
                {t('keyword')} {ExpandIcon}
              </h3>
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
    [
      AnnotationView,
      ExpandIcon,
      KeywordView,
      NavTreeView,
      panelExpanded,
      setViewPanelType,
      viewPanelType,
    ],
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
