import {
  AccountTree,
  FastForward,
  FastRewind,
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
} from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Popover,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { BookNav } from '../../../../core/book/book-base.js'
import {
  useAutoSection,
  useParagraphRepeat,
  usePersonReplace,
  useSpeechSpeed,
  useStopTimer,
  useStopTimerSeconds,
  useVoice,
} from '../../../../core/store.js'
import { isMobile } from '../../../../core/util/browser.js'
import { useAppBarSync } from '../../layout/use-app-bar.js'
import { useBookViewNav } from './nav.js'
import type { Player } from './player'
import { usePlayerSyncUI } from './player-states.js'
import type { BookContextProps } from './types'

function SettingLine(props: { children: React.ReactNode }) {
  return <Stack direction="row">{props.children}</Stack>
}

function TooltipButton(props: {
  tooltip: React.ReactNode
  disabled?: boolean
  onClick: React.MouseEventHandler | undefined
  children: React.ReactNode
}) {
  const { tooltip, ...btnProps } = props
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<HTMLSpanElement>()
  return (
    <>
      <Button
        sx={{
          minWidth: 30,
          minHeight: 30,
          padding: 0,
          margin: 0,
        }}
        onMouseEnter={(e) => {
          if (isMobile) return
          setAnchor(e.currentTarget)
          setOpen(true)
        }}
        onMouseLeave={(e) => {
          setAnchor(e.currentTarget)
          setOpen(false)
        }}
        {...btnProps}
      ></Button>
      {!isMobile && (
        <Popover
          sx={{ pointerEvents: 'none' }}
          open={open}
          anchorEl={anchor}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Box sx={{ padding: 1 }}>{tooltip}</Box>
        </Popover>
      )}
    </>
  )
}

function TimerRemainBadge(props: {
  started: boolean
  player: Player
  stopTimerEnabled: boolean
  stopTimerSeconds: number
}) {
  const { started, player, stopTimerEnabled, stopTimerSeconds } = props
  const refUsedSeconds = useRef<number>()
  const [resetCount, setResetCount] = useState<number>(0)
  const [remainSeconds, setRemainSeconds] = useState<number>(stopTimerSeconds)

  // stop timer
  useEffect(() => {
    if (!started) return
    if (!stopTimerEnabled) return
    if (!resetCount) return setResetCount((c) => c + 1)

    const usedSeconds = refUsedSeconds.current ?? 0

    const startAt = Date.now() / 1000
    let timer: NodeJS.Timer | null = null
    const fn = () => {
      const used = Date.now() / 1000 - startAt + usedSeconds
      refUsedSeconds.current = used
      const remain = stopTimerSeconds - used
      if (remain <= 0) {
        player.pause()
        refUsedSeconds.current = 0
        if (timer) clearInterval(timer)
        setRemainSeconds(0)
        return
      }
      setRemainSeconds(remain)
    }
    fn()
    timer = setInterval(fn, 1000)
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resetCount, player, started, stopTimerEnabled, stopTimerSeconds])

  const remainDisplay = useMemo(() => {
    return `${Math.floor(remainSeconds / 60)
      .toString()
      .padStart(2, '0')}
      :${(remainSeconds % 60).toFixed(0).padStart(2, '0')}`
  }, [remainSeconds])

  if (!stopTimerEnabled) return <></>

  return (
    <Chip
      onClick={() => {
        refUsedSeconds.current = 0
        setResetCount((c) => c + 1)
        setRemainSeconds(stopTimerSeconds)
      }}
      label={remainDisplay}
    ></Chip>
  )
}

export function usePlayerUI(
  props: BookContextProps & {
    started: boolean
    player: Player
    focusedNavs?: Set<BookNav>
  }
) {
  const { book, player, started, focusedNavs } = props
  const { NavTreeView, toggleNav } = useBookViewNav(book, player, focusedNavs)
  const { voice, voiceURI, setVoiceURI, allSortedVoices } = useVoice(book.item)
  const [autoNextSection] = useAutoSection()
  const [isPersonReplace] = usePersonReplace()
  const [stopTimerEnabled] = useStopTimer()
  const [stopTimerSeconds] = useStopTimerSeconds()
  const [speechSpeed] = useSpeechSpeed()
  const [paragraphRepeat] = useParagraphRepeat()

  const { isFirstSection, isLastSection, isFirstParagraph, isLastParagraph } =
    usePlayerSyncUI(player, {
      autoNextSection,
      isPersonReplace,
      speechSpeed,
      voice,
      paragraphRepeat,
    })

  const PlayerCtrlGroup = useMemo(() => {
    return (
      <ButtonGroup>
        <TooltipButton
          tooltip={<span>←</span>}
          onClick={() => {
            toggleNav()
          }}
        >
          <AccountTree />
        </TooltipButton>
        <TooltipButton
          tooltip={<span>←</span>}
          disabled={isFirstSection}
          onClick={() => {
            player.prevSection().catch(console.error)
          }}
        >
          <SkipPrevious />
        </TooltipButton>
        <TooltipButton
          tooltip={<span>↑</span>}
          disabled={isFirstParagraph}
          onClick={() => {
            player.prevParagraph().catch(console.error)
          }}
        >
          <FastRewind />
        </TooltipButton>
        <TooltipButton
          tooltip={<span>Space</span>}
          onClick={() => {
            if (started) player.pause()
            else player.start()
          }}
        >
          {started ? <Pause /> : <PlayArrow />}
        </TooltipButton>
        <TooltipButton
          tooltip={<span>↓</span>}
          disabled={isLastParagraph}
          onClick={() => {
            player.nextParagraph().catch(console.error)
          }}
        >
          <FastForward />
        </TooltipButton>
        <TooltipButton
          tooltip={<span>→</span>}
          disabled={isLastSection}
          onClick={() => {
            player.nextSection().catch(console.error)
          }}
        >
          <SkipNext />
        </TooltipButton>
      </ButtonGroup>
    )
  }, [
    isFirstParagraph,
    isFirstSection,
    isLastParagraph,
    isLastSection,
    player,
    started,
    toggleNav,
  ])

  const TimerRemainUI = useMemo(() => {
    return (
      <TimerRemainBadge
        key="timer-remain-ui"
        player={player}
        started={started}
        stopTimerEnabled={stopTimerEnabled}
        stopTimerSeconds={stopTimerSeconds}
      ></TimerRemainBadge>
    )
  }, [player, started, stopTimerEnabled, stopTimerSeconds])

  const voiceOptions = useMemo(
    () =>
      allSortedVoices.map((v) => ({
        label: v.name,
        value: v.voiceURI,
      })),
    [allSortedVoices]
  )
  const SelectVoices = useMemo(() => {
    return (
      <SettingLine>
        <Autocomplete
          key="select-voices"
          sx={{ width: 280 }}
          options={voiceOptions}
          value={voiceOptions.find((v) => v.value === voiceURI)}
          onChange={(_, value) => {
            setVoiceURI(value?.value ?? null)
          }}
          renderInput={(params) => <TextField {...params} size="small" />}
        ></Autocomplete>
      </SettingLine>
    )
  }, [setVoiceURI, voiceOptions, voiceURI])

  const headerLeftItems = useMemo(() => {
    return (
      <>
        {PlayerCtrlGroup}
        {TimerRemainUI}
      </>
    )
  }, [PlayerCtrlGroup, TimerRemainUI])

  const headerSettingItems = useMemo(() => {
    return <>{SelectVoices}</>
  }, [SelectVoices])

  useAppBarSync({
    title: '',
    left: headerLeftItems,
    settings: headerSettingItems,
  })

  return {
    voice,
    speechSpeed,
    autoNextSection,
    isPersonReplace,
    NavTreeView,
  }
}
