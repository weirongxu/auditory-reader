import { CircularProgress, Stack } from '@mui/material'
import { useUnmountEffect } from '@react-hookz/web'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BookNav } from '../../../../core/book/book-base.js'
import { useHotkeys } from '../../../hotkey/hotkey-state.js'
import { useViewPanelType } from '../../../store.js'
import { useAppTheme } from '../../../theme.js'
import { usePlayerSync } from './player-states.js'
import { usePlayerUI } from './player-ui.js'
import { usePlayer } from './player.js'
import type { BookContextProps } from './types'

export function useViewer({ uuid, book, pos, setPos }: BookContextProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [started, setStarted] = useState(false)
  const [activeNavs, setActiveNavs] = useState<BookNav[]>()
  const [loading, setLoading] = useState<boolean>()
  const [pageListCount, setPageListCount] = useState<number | undefined>()
  const [pageListCurIndex, setPageListCurIndex] = useState<number | undefined>()
  const { addHotkeys } = useHotkeys()
  const [, setViewPanelType] = useViewPanelType()
  const nav = useNavigate()

  const player = usePlayer(book, pos, iframeRef)
  usePlayerSync(player, {
    setPos,
    setStarted,
    setActiveNavs,
    setLoading,
    setPageListCount,
    setPageListCurIndex,
  })

  // dark scheme
  const theme = useAppTheme()
  useEffect(() => {
    player.iframeCtrler.updateColorTheme(theme.palette.mode)
  }, [player.iframeCtrler, theme.palette.mode])

  const MainContent = useMemo(
    () => (
      <Stack flex={1} position="relative">
        <div
          style={{
            position: 'absolute',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {loading && <CircularProgress></CircularProgress>}
        </div>
        <iframe title="viewer" ref={iframeRef}></iframe>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            zIndex: 1,
            height: '4px',
            width: '100%',
            background: 'var(--main-bg)',
          }}
        >
          <div
            style={{
              width: `${
                pageListCurIndex && pageListCount
                  ? ((pageListCurIndex / pageListCount) * 100).toFixed(2)
                  : 0
              }%`,
              height: '100%',
              background: 'var(--main-fg)',
            }}
          ></div>
        </div>
      </Stack>
    ),
    [loading, pageListCount, pageListCurIndex],
  )

  const { BookPanelView, toggleBookmark } = usePlayerUI({
    uuid,
    book,
    pos,
    setPos,
    player,
    started,
    activeNavs,
  })

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

    return addHotkeys([
      [' ', t('hotkey.playToggle'), () => player.toggle()],
      [
        't',
        t('hotkey.navToggle'),
        () => setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav')),
      ],
      [
        { shift: true, key: 't' },
        t('hotkey.bookmarksPanelToggle'),
        () => setViewPanelType((v) => (v === 'bookmark' ? 'none' : 'bookmark')),
      ],
      ['b', t('hotkey.bookmarkToggle'), () => toggleBookmark()],
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
      ['PageUp', t('hotkey.prevPage'), prevPage],
      ['PageDown', t('hotkey.nextPage'), nextPage],
      ['k', t('hotkey.prevParagraph'), prevParagraph],
      ['j', t('hotkey.nextParagraph'), nextParagraph],
      ['ArrowUp', t('hotkey.prevParagraph'), prevParagraph],
      ['ArrowDown', t('hotkey.nextParagraph'), nextParagraph],
    ])
  }, [addHotkeys, nav, player, setViewPanelType, toggleBookmark])

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
