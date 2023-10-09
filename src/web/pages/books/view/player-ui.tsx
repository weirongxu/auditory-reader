import {
  AccountTree,
  Bookmark,
  BookmarkBorder,
  Bookmarks,
  FastForward,
  FastRewind,
  FirstPage,
  Pause,
  PlayArrow,
  Save,
  SkipNext,
  SkipPrevious,
  Start,
} from '@mui/icons-material'
import {
  Autocomplete,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Popover,
  TextField,
} from '@mui/material'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksTmpStoreRouter } from '../../../../core/api/books/tmp-store.js'
import type { BookNav } from '../../../../core/book/book-base.js'
import { isMobile } from '../../../../core/util/browser.js'
import { async } from '../../../../core/util/promise.js'
import {
  useAutoSection,
  usePageList,
  useParagraphRepeat,
  usePersonReplace,
  useSpeechSpeed,
  useStopTimer,
  useStopTimerSeconds,
  useVoice,
} from '../../../store.js'
import { SettingLine } from '../../layout/settings.js'
import { useAppBarSync } from '../../layout/use-app-bar.js'
import { useBookPanel } from './panel/panel.js'
import type { Player } from './player'
import { usePlayerUISync } from './player-states.js'
import type { BookContextProps } from './types'

function TooltipButton({
  tooltip,
  ...btnProps
}: {
  tooltip: React.ReactNode
  disabled?: boolean
  onClick: React.MouseEventHandler | undefined
  children: React.ReactNode
}) {
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
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <div style={{ padding: 4 }}>{tooltip}</div>
        </Popover>
      )}
    </>
  )
}

function TimerRemainBadge({
  started,
  player,
  stopTimerEnabled,
  stopTimerSeconds,
}: {
  started: boolean
  player: Player
  stopTimerEnabled: boolean
  stopTimerSeconds: number
}) {
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
    let timer: NodeJS.Timeout | null = null
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

export function usePlayerUI({
  book,
  player,
  pos,
  started,
  activeNavs,
}: BookContextProps & {
  started: boolean
  player: Player
  activeNavs?: BookNav[]
}) {
  const nav = useNavigate()
  const {
    bookmarks,
    BookPanelView,
    setViewPanelType,
    toggleBookmark,
    activeBookmark,
  } = useBookPanel(book, player, activeNavs, pos)
  const { voice, voiceURI, setVoiceURI, allSortedVoices } = useVoice(book.item)
  const [autoNextSection] = useAutoSection()
  const [isPersonReplace] = usePersonReplace()
  const [stopTimerEnabled] = useStopTimer()
  const [stopTimerSeconds] = useStopTimerSeconds()
  const [speechSpeed] = useSpeechSpeed()
  const [paragraphRepeat] = useParagraphRepeat()
  const [pageList] = usePageList()
  const [collapsed, setCollapsed] = useState(isMobile)

  const { isFirstSection, isLastSection, isFirstParagraph, isLastParagraph } =
    usePlayerUISync(player, {
      bookmarks,
      autoNextSection,
      isPersonReplace,
      speechSpeed,
      voice,
      paragraphRepeat,
      pageList,
    })

  const PlayerCtrlGroup = useMemo(() => {
    const buttons: JSX.Element[] = [
      <Button
        key="nav"
        onClick={() => {
          setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav'))
        }}
      >
        <AccountTree />
      </Button>,
      <Button
        key="bookmarks"
        onClick={() => {
          setViewPanelType((v) => (v === 'bookmark' ? 'none' : 'bookmark'))
        }}
      >
        <Bookmarks />
      </Button>,
      <Button
        key="bookmark"
        onClick={() => {
          toggleBookmark()
        }}
      >
        {activeBookmark ? <Bookmark /> : <BookmarkBorder />}
      </Button>,
    ]

    if (!collapsed)
      buttons.push(
        <TooltipButton
          key="prev-section"
          tooltip={<span>shift + ←</span>}
          disabled={isFirstSection}
          onClick={() => {
            player.prevSection().catch(console.error)
          }}
        >
          <SkipPrevious />
        </TooltipButton>,
        <TooltipButton
          key="prev-paragraph"
          tooltip={<span>↑</span>}
          disabled={isFirstSection && isFirstParagraph}
          onClick={() => {
            player.prevParagraph().catch(console.error)
          }}
        >
          <FastRewind />
        </TooltipButton>,
      )

    buttons.push(
      <TooltipButton
        key="play"
        tooltip={<span>Space</span>}
        onClick={() => {
          if (started) player.pause()
          else player.start()
        }}
      >
        {started ? <Pause /> : <PlayArrow />}
      </TooltipButton>,
    )

    if (!collapsed)
      buttons.push(
        <TooltipButton
          key="next-paragraph"
          tooltip={<span>↓</span>}
          disabled={isLastSection && isLastParagraph}
          onClick={() => {
            player.nextParagraph().catch(console.error)
          }}
        >
          <FastForward />
        </TooltipButton>,
        <TooltipButton
          key="next-section"
          tooltip={<span>shift + →</span>}
          disabled={isLastSection}
          onClick={() => {
            player.nextSection().catch(console.error)
          }}
        >
          <SkipNext />
        </TooltipButton>,
      )

    if (isMobile)
      buttons.push(
        <Button
          key="collapse"
          onClick={() => {
            setCollapsed((c) => !c)
          }}
        >
          {collapsed ? <Start /> : <FirstPage />}
        </Button>,
      )

    return <ButtonGroup>{buttons}</ButtonGroup>
  }, [
    activeBookmark,
    collapsed,
    isFirstParagraph,
    isFirstSection,
    isLastParagraph,
    isLastSection,
    player,
    setViewPanelType,
    started,
    toggleBookmark,
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
    [allSortedVoices],
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

  const TmpStoreBtn = useMemo(() => {
    return (
      <IconButton
        title={t('tmpStore')}
        onClick={() => {
          async(async () => {
            const entity = await booksTmpStoreRouter.action({})
            nav(`/books/added-successful/${entity.uuid}`)
          })
        }}
      >
        <Save />
      </IconButton>
    )
  }, [nav])

  const topRight = useMemo(() => {
    return <>{TimerRemainUI}</>
  }, [TimerRemainUI])

  const bottomLeft = useMemo(() => {
    return <>{PlayerCtrlGroup}</>
  }, [PlayerCtrlGroup])

  const bottomRight = useMemo(() => {
    return <>{book.item.isTmp && TmpStoreBtn}</>
  }, [TmpStoreBtn, book.item.isTmp])

  const appSettings = useMemo(() => {
    return <>{SelectVoices}</>
  }, [SelectVoices])

  useAppBarSync({
    topRight,
    bottomLeft,
    bottomRight,
    settings: appSettings,
  })

  return {
    voice,
    speechSpeed,
    autoNextSection,
    isPersonReplace,
    toggleBookmark,
    BookPanelView,
    curIsBookmark: activeBookmark,
  }
}
