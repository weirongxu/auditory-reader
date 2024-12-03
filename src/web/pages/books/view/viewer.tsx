import { useUnmountEffect } from '@react-hookz/web'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BookTypes } from '../../../../core/book/types.js'
import { FlexBox } from '../../../components/flex-box.js'
import { SpinCenter } from '../../../components/spin.js'
import { useHotkeys } from '../../../hotkey/hotkey-state.js'
import { useViewPanelType } from '../../../store.js'
import { useColorScheme } from '../../../theme.js'
import { useBookContext } from '../view.context.js'
import { usePlayerSync } from './player-states.js'
import { usePlayerUI } from './player-ui.js'
import { useCreatePlayer } from './player.js'
import { ViewProgressBar } from './progress-bar.js'

export function useViewer() {
  const { book, pos, setPos } = useBookContext()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [started, setStarted] = useState(false)
  const [activeNavs, setActiveNavs] = useState<BookTypes.Nav[]>()
  const [loading, setLoading] = useState<boolean>(false)
  const [scrollPercent, setScrollPercent] = useState<number | undefined>()
  const [selection, setSelection] = useState<
    BookTypes.PropertyRange | undefined
  >()
  const { addHotkeys } = useHotkeys()
  const [, setViewPanelType] = useViewPanelType()
  const nav = useNavigate()

  const player = useCreatePlayer(book, pos, iframeRef)
  usePlayerSync(player, {
    setPos,
    setStarted,
    setActiveNavs,
    setLoading,
    setScrollPercent,
    setSelection,
  })

  // dark scheme
  const theme = useColorScheme()
  useEffect(() => {
    player.iframeCtrler.updateColorTheme(theme)
  }, [player.iframeCtrler, theme])

  const { BookPanelView } = usePlayerUI({
    player,
    started,
    activeNavs,
    selection,
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
            <SpinCenter />
          </div>
        )}
        {/* NOTE: sandbox will caused safari onclick not work in iframe */}
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
      // panel
      [
        't',
        t('hotkey.navToggle'),
        () => setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav')),
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
      [
        { shift: true, key: 'm' },
        t('hotkey.keywordPanelToggle'),
        () => setViewPanelType((v) => (v === 'keyword' ? 'none' : 'keyword')),
      ],
      [
        { shift: true, key: 'b' },
        t('hotkey.keywordAdd'),
        () =>
          selection?.selectedText &&
          player.keywords.add({ pos, keyword: selection.selectedText }),
      ],

      // navigation
      ['u', t('hotkey.goBack'), () => nav('../')],

      // play
      [' ', t('hotkey.playToggle'), () => player.toggle()],
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
      ['k', t('hotkey.prevParagraph'), prevParagraph],
      ['j', t('hotkey.nextParagraph'), nextParagraph],
      ['ArrowLeft', t('hotkey.jumpPrevPage'), jumpPrevPage],
      ['ArrowRight', t('hotkey.jumpNextPage'), jumpNextPage],
      ['ArrowUp', t('hotkey.prevParagraph'), prevParagraph],
      ['ArrowDown', t('hotkey.nextParagraph'), nextParagraph],
      ['Home', t('hotkey.firstPage'), firstPage],
      ['End', t('hotkey.lastPage'), lastPage],
      ['PageUp', t('hotkey.prevPage'), prevPage],
      ['PageDown', t('hotkey.nextPage'), nextPage],
      [['g', 'g'], t('hotkey.firstParagraph'), firstParagraph],
      [{ shift: true, key: 'G' }, t('hotkey.lastParagraph'), lastParagraph],
    ])
  }, [addHotkeys, book, nav, player, pos, selection, setViewPanelType])

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
