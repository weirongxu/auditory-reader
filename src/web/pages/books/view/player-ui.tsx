import {
  faBackward,
  faBackwardFast,
  faBookBookmark,
  faBookmark,
  faDownLeftAndUpRightToCenter,
  faFileLines,
  faFloppyDisk,
  faFolderTree,
  faForward,
  faForwardFast,
  faPause,
  faPlay,
  faQuoteRight,
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
  hotkey,
  description,
  ...btnProps
}: {
  hotkey?: string
  description?: string
  disabled?: boolean
  onClick: React.MouseEventHandler | undefined
  children: React.ReactNode
}) {
  const tooltip = useMemo(
    () => (
      <Space>
        {description}
        {hotkey ? <span className="keyboard">{hotkey}</span> : null}
      </Space>
    ),
    [description, hotkey],
  )
  return (
    <ControlButton {...btnProps}>
      <Popover
        style={{ pointerEvents: 'none' }}
        content={isMobile ? null : tooltip}
        placement="top"
      >
        <div>{btnProps.children}</div>
      </Popover>
    </ControlButton>
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
  selection?: BookTypes.PropertyRange
}) {
  const { book, pos } = useBookContext()
  const nav = useNavigate()
  const { annotations, keywords, setViewPanelType, BookPanelView } =
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
      keywords,
      autoNextSection,
      isPersonReplace,
      speechSpeed,
      voice,
      paragraphRepeat,
      pageList,
      fontSize,
      disabledVertical,
    })

  const PlayerCtrlGroup1 = useMemo(() => {
    const buttons: (JSX.Element | null)[] = [
      <TooltipButton
        key="nav"
        hotkey="t"
        description={t('nav')}
        onClick={() => {
          setViewPanelType((v) => (v === 'nav' ? 'none' : 'nav'))
        }}
      >
        <Icon icon={faFolderTree} />
      </TooltipButton>,
      annotations && annotations.length > 0 ? (
        <TooltipButton
          key="annotations"
          hotkey="m"
          description={t('annotation')}
          onClick={() => {
            setViewPanelType((v) =>
              v === 'annotation' ? 'none' : 'annotation',
            )
          }}
        >
          <Icon icon={faBookBookmark} />
        </TooltipButton>
      ) : null,
      keywords && keywords.length > 0 ? (
        <TooltipButton
          key="keywords"
          description={t('keyword')}
          hotkey="M"
          onClick={() => {
            setViewPanelType((v) => (v === 'keyword' ? 'none' : 'keyword'))
          }}
        >
          <Icon icon={faFileLines} />
        </TooltipButton>
      ) : null,
    ]

    if (!collapsed)
      buttons.push(
        <TooltipButton
          key="prev-section"
          hotkey="shift + ←"
          description={t('hotkey.prevSection')}
          disabled={isFirstSection}
          onClick={() => {
            player.prevSection().catch(console.error)
          }}
        >
          <Icon icon={faBackwardFast} />
        </TooltipButton>,
        <TooltipButton
          key="prev-paragraph"
          hotkey="↑"
          description={t('hotkey.prevParagraph')}
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
        hotkey="Space"
        description={t('hotkey.playToggle')}
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
          hotkey="↓"
          description={t('hotkey.nextParagraph')}
          disabled={isLastSection && isLastParagraph}
          onClick={() => {
            player.nextParagraph().catch(console.error)
          }}
        >
          <Icon icon={faForward} />
        </TooltipButton>,
        <TooltipButton
          key="next-section"
          hotkey="shift + →"
          description={t('hotkey.nextSection')}
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

    return <Button.Group>{buttons.filter(Boolean)}</Button.Group>
  }, [
    annotations,
    collapsed,
    isFirstParagraph,
    isFirstSection,
    isLastParagraph,
    isLastSection,
    keywords,
    player,
    setViewPanelType,
    started,
  ])

  const PlayerCtrlGroup2 = useMemo(() => {
    const buttons: (JSX.Element | null)[] = [
      <TooltipButton
        key="annotation"
        description={t('hotkey.annotationToggle')}
        hotkey="b"
        onClick={() => {
          void player.annotations.toggle(pos, selection ?? null)
        }}
      >
        <Icon icon={faBookmark} />
      </TooltipButton>,
      selection?.selectedText ? (
        <TooltipButton
          key="keyword"
          description={t('hotkey.keywordAdd')}
          hotkey="B"
          onClick={() => {
            void player.keywords.add({ pos, keyword: selection.selectedText })
          }}
        >
          <Icon icon={faQuoteRight} />
        </TooltipButton>
      ) : null,
    ]

    return <Button.Group>{buttons.filter(Boolean)}</Button.Group>
  }, [player, pos, selection])

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
            const entity = await booksTmpStoreRouter.json({})
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
    bottomLeft1: PlayerCtrlGroup1,
    bottomLeft2: PlayerCtrlGroup2,
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
