import { CircularProgress } from '@mui/material'
import { useUnmountEffect } from '@react-hookz/web'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BookNav } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { FlexBox } from '../../../components/flex-box.js'
import { useHotkeys } from '../../../hotkey/hotkey-state.js'
import { useViewPanelType } from '../../../store.js'
import { useAppTheme } from '../../../theme.js'
import { usePlayerSync } from './player-states.js'
import { usePlayerUI } from './player-ui.js'
import { usePlayer } from './player.js'
import { ViewProgressBar } from './progress-bar.js'
import type { BookContextProps } from './types'

export function useViewer({
  uuid,
  book,
  pos,
  setPos,
  reload,
}: BookContextProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [started, setStarted] = useState(false)
  const [activeNavs, setActiveNavs] = useState<BookNav[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const [scrollPercent, setScrollPercent] = useState<number | undefined>()
  const [selection, setSelection] = useState<
    BookTypes.PropertyAnnotationRange | undefined
  >()
  const { addHotkeys } = useHotkeys()
  const [, setViewPanelType] = useViewPanelType()
  const nav = useNavigate()

  const player = usePlayer(book, pos, iframeRef)
  usePlayerSync(player, {
    setPos,
    setStarted,
    setActiveNavs,
    setLoading,
    setScrollPercent,
    setSelection,
  })

  // dark scheme
  const theme = useAppTheme()
  useEffect(() => {
    player.iframeCtrler.updateColorTheme(theme.palette.mode)
  }, [player.iframeCtrler, theme.palette.mode])

  const { BookPanelView } = usePlayerUI({
    uuid,
    book,
    pos,
    setPos,
    player,
    started,
    activeNavs,
    selection,
    reload,
  })

  const MainContent = useMemo(
    () => (
      <FlexBox flex={1} style={{ position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              zIndex: 2,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress></CircularProgress>
          </div>
        )}
        <iframe
          style={{ padding: '0 4px' }}
          title="viewer"
          ref={iframeRef}
        ></iframe>
        <ViewProgressBar
          player={player}
          scrollPercent={scrollPercent}
        ></ViewProgressBar>
      </FlexBox>
    ),
    [loading, scrollPercent, player],
  )

  // hotkey
  useEffect(() => {
    const jumpPrevPage = () => player.prevPage(1, true)
    const jumpNextPage = () => player.nextPage(1, true)
    const firstPage = () => player.gotoPage(0, true)
    const lastPage = () => player.gotoPage(-1, true)
    const prevPage = () => player.prevPage(1, false)
    const nextPage = () => player.nextPage(1, false)
    const prevSection = () => player.prevSection()
    const nextSection = () => player.nextSection()
    const firstParagraph = () => player.gotoParagraph(0)
    const lastParagraph = () => player.gotoParagraph(-1)
    const prevParagraph = () => player.prevParagraph()
    const nextParagraph = () => player.nextParagraph()

    return addHotkeys([
      [' ', t('hotkey.playToggle'), () => player.toggle()],
      [
        't',
        t('hotkey.navToggle'),
        () => setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav')),
      ],
      [
        { shift: true, key: 'M' },
        t('hotkey.bookmarksPanelToggle'),
        () => setViewPanelType((v) => (v === 'bookmark' ? 'none' : 'bookmark')),
      ],
      [
        'm',
        t('hotkey.annotationsPanelToggle'),
        () =>
          setViewPanelType((v) => (v === 'annotation' ? 'none' : 'annotation')),
      ],
      [
        'b',
        t('hotkey.annotationToggle'),
        () => player.annotations.toggle(pos, selection ?? null),
      ],
      ['u', t('hotkey.goBack'), () => nav('../../')],
      [{ shift: true, key: 'h' }, t('hotkey.prevSection'), prevSection],
      [{ shift: true, key: 'l' }, t('hotkey.nextSection'), nextSection],
      [{ shift: true, key: 'ArrowLeft' }, t('hotkey.prevSection'), prevSection],
      [
        { shift: true, key: 'ArrowRight' },
        t('hotkey.nextSection'),
        nextSection,
      ],
      ['h', t('hotkey.jumpPrevPage'), jumpPrevPage],
      ['l', t('hotkey.jumpNextPage'), jumpNextPage],
      ['ArrowLeft', t('hotkey.jumpPrevPage'), jumpPrevPage],
      ['ArrowRight', t('hotkey.jumpNextPage'), jumpNextPage],
      ['Home', t('hotkey.firstPage'), firstPage],
      ['End', t('hotkey.lastPage'), lastPage],
      ['PageUp', t('hotkey.prevPage'), prevPage],
      ['PageDown', t('hotkey.nextPage'), nextPage],
      [['g', 'g'], t('hotkey.firstParagraph'), firstParagraph],
      [{ shift: true, key: 'G' }, t('hotkey.lastParagraph'), lastParagraph],
      ['k', t('hotkey.prevParagraph'), prevParagraph],
      ['j', t('hotkey.nextParagraph'), nextParagraph],
      ['ArrowUp', t('hotkey.prevParagraph'), prevParagraph],
      ['ArrowDown', t('hotkey.nextParagraph'), nextParagraph],
    ])
  }, [addHotkeys, nav, player, pos, selection, setViewPanelType])

  // leave
  useUnmountEffect(() => {
    player.pause()
  })

  return {
    activeNavs,
    BookPanelView,
    MainContent,
  }
}
