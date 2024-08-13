import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons'
import {
  faBackward,
  faBackwardFast,
  faBookBookmark,
  faBookmark,
  faDownLeftAndUpRightToCenter,
  faFloppyDisk,
  faFolderTree,
  faForward,
  faForwardFast,
  faPause,
  faPlay,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons'
import { Button, Popover, Select, Space, Tag } from 'antd'
import { t } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksTmpStoreRouter } from '../../../../core/api/books/tmp-store.js'
import type { BookNav } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { filterOptionLabel } from '../../../../core/util/antd.js'
import { isMobile } from '../../../../core/util/browser.js'
import { async } from '../../../../core/util/promise.js'
import { Icon } from '../../../components/icon.js'
import {
  useAutoSection,
  useDisabledVertical,
  useFontSize,
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
import { useBookEditDialog } from '../edit.js'
import { useBookContext } from '../view.context.js'
import { BookSearchButton } from './book-search.js'
import { useBookPanel } from './panel/panel.js'
import type { Player } from './player'
import { usePlayerUISync } from './player-states.js'
import { useHotkeys } from '../../../hotkey/hotkey-state.js'

function ControlButton(props: {
  disabled?: boolean
  onClick: React.MouseEventHandler | undefined
  children: React.ReactNode
}) {
  return (
    <Button
      style={{ padding: '14px 4px' }}
      size="small"
      type="primary"
      {...props}
    ></Button>
  )
}

function TooltipButton({
  tooltip,
  ...btnProps
}: {
  tooltip: React.ReactNode
  disabled?: boolean
  onClick: React.MouseEventHandler | undefined
  children: React.ReactNode
}) {
  return (
    <Popover
      style={{ pointerEvents: 'none' }}
      content={isMobile ? null : tooltip}
      placement="top"
    >
      <ControlButton {...btnProps} />
    </Popover>
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
    let timer: NodeJS.Timeout | undefined = undefined
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
      clearInterval(timer)
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
    <Tag
      onClick={() => {
        refUsedSeconds.current = 0
        setResetCount((c) => c + 1)
        setRemainSeconds(stopTimerSeconds)
      }}
    >
      {remainDisplay}
    </Tag>
  )
}

function BookEditButton() {
  const { book, reload } = useBookContext()
  const { openBookEdit } = useBookEditDialog(reload)
  const { addHotkey } = useHotkeys()

  useEffect(() => {
    return addHotkey(
      'e',
      t('hotkey.editBook'),
      () => {
        openBookEdit(book.item.uuid)
      },
      { level: 100 },
    )
  }, [addHotkey, book.item.uuid, openBookEdit])

  return (
    <Button block type="primary" onClick={() => openBookEdit(book.item.uuid)}>
      {t('editBook')}
    </Button>
  )
}

function VoicesSelect() {
  const { book } = useBookContext()
  const { voiceURI, setVoiceURI, allSortedVoices } = useVoice(book.item)
  const voiceOptions = useMemo(
    () =>
      allSortedVoices.map((v) => ({
        label: v.name,
        value: v.voiceURI,
      })),
    [allSortedVoices],
  )
  return (
    <SettingLine>
      <Select
        showSearch
        filterOption={filterOptionLabel}
        popupMatchSelectWidth={false}
        style={{ width: '100%' }}
        value={voiceURI}
        onChange={(value) => setVoiceURI(value)}
        options={voiceOptions}
      ></Select>
    </SettingLine>
  )
}

export function usePlayerUI({
  player,
  started,
  activeNavs,
  selection,
}: {
  started: boolean
  player: Player
  activeNavs?: BookNav[]
  selection?: BookTypes.PropertyAnnotationRange
}) {
  const { book, pos } = useBookContext()
  const nav = useNavigate()
  const { annotations, activeAnnotation, setViewPanelType, BookPanelView } =
    useBookPanel(book, player, activeNavs, pos, selection)
  const { voice } = useVoice(book.item)
  const [autoNextSection] = useAutoSection()
  const [isPersonReplace] = usePersonReplace()
  const [stopTimerEnabled] = useStopTimer()
  const [stopTimerSeconds] = useStopTimerSeconds()
  const [speechSpeed] = useSpeechSpeed()
  const [paragraphRepeat] = useParagraphRepeat()
  const [pageList] = usePageList()
  const [fontSize] = useFontSize()
  const [disabledVertical] = useDisabledVertical()
  const [collapsed, setCollapsed] = useState(isMobile)

  const { isFirstSection, isLastSection, isFirstParagraph, isLastParagraph } =
    usePlayerUISync(player, {
      annotations,
      autoNextSection,
      isPersonReplace,
      speechSpeed,
      voice,
      paragraphRepeat,
      pageList,
      fontSize,
      disabledVertical,
    })

  const PlayerCtrlGroup = useMemo(() => {
    const buttons: JSX.Element[] = [
      <TooltipButton
        key="nav"
        tooltip={<span>t</span>}
        onClick={() => {
          setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav'))
        }}
      >
        <Icon icon={faFolderTree} />
      </TooltipButton>,
      <TooltipButton
        key="annotations"
        tooltip={<span>m</span>}
        onClick={() => {
          setViewPanelType((v) => (v === 'annotation' ? 'none' : 'annotation'))
        }}
      >
        <Icon icon={faBookBookmark} />
      </TooltipButton>,
      <TooltipButton
        key="annotation"
        tooltip={<span>b</span>}
        onClick={() => {
          void player.annotations.toggle(pos, selection ?? null)
        }}
      >
        {activeAnnotation ? (
          <Icon icon={faBookmark} />
        ) : (
          <Icon icon={faBookmarkRegular} />
        )}
      </TooltipButton>,
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
          <Icon icon={faBackwardFast} />
        </TooltipButton>,
        <TooltipButton
          key="prev-paragraph"
          tooltip={<span>↑</span>}
          disabled={isFirstSection && isFirstParagraph}
          onClick={() => {
            player.prevParagraph().catch(console.error)
          }}
        >
          <Icon icon={faBackward} />
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
        {started ? <Icon icon={faPause} /> : <Icon icon={faPlay} />}
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
          <Icon icon={faForward} />
        </TooltipButton>,
        <TooltipButton
          key="next-section"
          tooltip={<span>shift + →</span>}
          disabled={isLastSection}
          onClick={() => {
            player.nextSection().catch(console.error)
          }}
        >
          <Icon icon={faForwardFast} />
        </TooltipButton>,
      )

    if (isMobile)
      buttons.push(
        <ControlButton
          key="collapse"
          onClick={() => {
            setCollapsed((c) => !c)
          }}
        >
          {collapsed ? (
            <Icon icon={faUpRightAndDownLeftFromCenter} />
          ) : (
            <Icon icon={faDownLeftAndUpRightToCenter} />
          )}
        </ControlButton>,
      )

    return <Button.Group>{buttons}</Button.Group>
  }, [
    activeAnnotation,
    collapsed,
    isFirstParagraph,
    isFirstSection,
    isLastParagraph,
    isLastSection,
    player,
    pos,
    selection,
    setViewPanelType,
    started,
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

  const TmpStoreBtn = useMemo(() => {
    return (
      <Button
        shape="circle"
        type="text"
        title={t('tmpStore')}
        onClick={() => {
          async(async () => {
            const entity = await booksTmpStoreRouter.action({})
            nav(`/books/added-successful/${entity.uuid}`)
          })
        }}
        icon={<Icon icon={faFloppyDisk} />}
      ></Button>
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
    return (
      <Space direction="vertical">
        <BookSearchButton player={player} />
        <BookEditButton />
        <VoicesSelect />
      </Space>
    )
  }, [player])

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
    BookPanelView,
  }
}
