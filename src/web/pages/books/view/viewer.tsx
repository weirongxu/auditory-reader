import { CircularProgress, Stack, useTheme } from '@mui/material'
import { useUnmountEffect } from '@react-hookz/web'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BookNav } from '../../../../core/book/book-base.js'
import { useHotkeys } from '../../../hotkey/hotkey-state.js'
import { usePlayerSync } from './player-states.js'
import { usePlayerUI } from './player-ui.js'
import { usePlayer } from './player.js'
import type { BookContextProps } from './types'
import { useNavigate } from 'react-router-dom'
import { useViewPanelType } from '../../../store.js'

export function useViewer(props: BookContextProps) {
  const { book, pos, setPos } = props
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [started, setStarted] = useState(false)
  const [activeNavs, setActiveNavs] = useState<BookNav[]>()
  const [loading, setLoading] = useState<boolean>()
  const { addHotkeys } = useHotkeys()
  const [, setViewPanelType] = useViewPanelType()
  const nav = useNavigate()

  const player = usePlayer(book, pos, iframeRef)
  usePlayerSync(player, {
    setPos,
    setStarted,
    setActiveNavs,
    setLoading,
  })

  // dark scheme
  const theme = useTheme()
  useEffect(() => {
    player.iframeCtrler.updateColorTheme(theme.palette.mode)
  }, [player.iframeCtrler, theme.palette.mode])

  // hotkey
  useEffect(() => {
    const jumpPrevPage = () => player.prevPage(1, true)
    const jumpNextPage = () => player.nextPage(1, true)
    const prevPage = () => player.prevPage(1, false)
    const nextPage = () => player.nextPage(1, false)
    const prevSection = () => player.prevSection()
    const nextSection = () => player.nextSection()
    const prevParagraph = () => player.prevParagraph()
    const nextParagraph = () => player.nextParagraph()

    const dispose = addHotkeys([
      [' ', () => player.toggle()],
      ['t', () => setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav'))],
      [
        { shift: true, key: 't' },
        () => setViewPanelType((v) => (v === 'bookmark' ? 'none' : 'bookmark')),
      ],
      ['b', () => toggleBookmark()],
      ['u', () => nav('../../')],
      [{ shift: true, key: 'h' }, prevSection],
      [{ shift: true, key: 'l' }, nextSection],
      [{ shift: true, key: 'arrowleft' }, prevSection],
      [{ shift: true, key: 'arrowright' }, nextSection],
      ['h', jumpPrevPage],
      ['l', jumpNextPage],
      ['arrowleft', jumpPrevPage],
      ['arrowright', jumpNextPage],
      ['pageup', prevPage],
      ['pagedown', nextPage],
      ['k', prevParagraph],
      ['j', nextParagraph],
      ['arrowup', prevParagraph],
      ['arrowdown', nextParagraph],
    ])
    return dispose
  })

  const MainContent = useMemo(
    () => (
      <Stack flex={1} position="relative">
        {loading && (
          <Stack position="absolute" zIndex={2}>
            <CircularProgress></CircularProgress>
          </Stack>
        )}
        <iframe
          title="viewer"
          ref={iframeRef}
          sandbox="allow-same-origin"
        ></iframe>
      </Stack>
    ),
    [loading]
  )

  const { BookPanelView, toggleBookmark } = usePlayerUI({
    ...props,
    player,
    started,
    activeNavs,
  })

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
