import { useTheme } from '@mui/material'
import { useUnmountEffect } from '@react-hookz/web'
import { useEffect, useMemo, useRef, useState } from 'react'
import useWindowFocus from 'use-window-focus'
import type { BookNav } from '../../../../core/book/book-base.js'
import { async } from '../../../../core/util/promise.js'
import { usePlayerIframe } from './player-iframe-controller.js'
import { usePlayerSync } from './player-states.js'
import { usePlayerUI } from './player-ui.js'
import { usePlayer } from './player.js'
import type { BookContextProps } from './types'

export function useViewer(props: BookContextProps) {
  const { book, pos, setPos } = props
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [started, setStarted] = useState(false)
  const [focusedNavs, setFocusedNavs] = useState<Set<BookNav>>()

  const player = usePlayer(book, pos, iframeRef)
  usePlayerIframe(player)
  usePlayerSync(player, {
    setPos,
    setStarted,
    setFocusedNavs,
  })

  // dark scheme
  const theme = useTheme()
  useEffect(() => {
    player.iframeCtrler.updateColorTheme(theme.palette.mode)
  }, [player.iframeCtrler, theme.palette.mode])

  const MainContent = useMemo(
    () => (
      <iframe
        title="viewer"
        ref={iframeRef}
        sandbox="allow-same-origin"
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
        }}
      ></iframe>
    ),
    [iframeRef]
  )

  const { NavTreeView } = usePlayerUI({
    ...props,
    player,
    started,
    focusedNavs,
  })

  // wake lock
  const windowFocused = useWindowFocus()
  const refWakeLock = useRef<WakeLockSentinel>()
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    if (!windowFocused) return

    async(async () => {
      await refWakeLock.current?.release()
      if (started) {
        refWakeLock.current = await navigator.wakeLock.request('screen')
      }
    })
  }, [started, windowFocused])

  // leave
  useUnmountEffect(() => {
    player.pause()
  })

  return {
    NavTreeView,
    MainContent,
  }
}
