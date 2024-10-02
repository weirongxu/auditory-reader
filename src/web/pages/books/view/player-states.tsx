import type { Dispatch } from 'react'
import { useEffect, useMemo } from 'react'
import type { BookNav } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { isMobile } from '../../../../core/util/browser.js'
import { ChangedEmitter } from '../../../../core/util/emitter.js'
import type { PageListType } from '../../../store.js'
import type { Player } from './player.js'

type PlayerStates = {
  started: boolean
  pos: BookTypes.PropertyPosition
  activeNavs: BookNav[]
  loading: boolean
  scrollPercent: number | undefined
  selection: BookTypes.PropertyRange | undefined
}

type PlayerReadonlyStates = {
  annotations: BookTypes.PropertyAnnotation[] | undefined
  keywords: BookTypes.PropertyKeyword[] | undefined
  isPersonReplace: boolean
  speechSpeed: number
  voice: null | SpeechSynthesisVoice
  autoNextSection: boolean
  paragraphRepeat: number
  pageList: PageListType
  fontSize: number
  disabledVertical: boolean
}

export class PlayerStatesManager {
  #states: PlayerStates = {
    started: false,
    pos: { section: 0, paragraph: 0 },
    activeNavs: [],
    loading: false,
    scrollPercent: undefined,
    selection: undefined,
  }

  events = new ChangedEmitter<PlayerStates>()

  get started() {
    return this.#states.started
  }

  set started(started: boolean) {
    this.#states.started = started
    this.events.fire('started', started)
  }

  get pos() {
    return this.#states.pos
  }

  set pos(pos: BookTypes.PropertyPosition) {
    this.#states.pos = pos
    this.events.fire('pos', pos)
  }

  set activeNavs(activeNavs: BookNav[]) {
    this.#states.activeNavs = activeNavs
    this.events.fire('activeNavs', activeNavs)
  }

  get loading() {
    return this.#states.loading
  }

  set loading(loading: boolean) {
    this.#states.loading = loading
    this.events.fire('loading', loading)
  }

  get scrollPercent() {
    return this.#states.scrollPercent
  }

  set scrollPercent(scrollPercent: number | undefined) {
    this.#states.scrollPercent = scrollPercent
    this.events.fire('scrollPercent', scrollPercent)
  }

  get selection() {
    return this.#states.selection
  }

  set selection(selection: BookTypes.PropertyRange | undefined) {
    this.#states.selection = selection
    this.events.fire('selection', selection)
  }

  #readonlyStates: PlayerReadonlyStates = {
    annotations: [],
    keywords: [],
    isPersonReplace: false,
    speechSpeed: 1,
    voice: null,
    autoNextSection: false,
    paragraphRepeat: 1,
    pageList: 'double',
    fontSize: 16,
    disabledVertical: false,
  }

  uiEvents = new ChangedEmitter<PlayerReadonlyStates>()

  get annotations() {
    return this.#readonlyStates.annotations
  }

  get keywords() {
    return this.#readonlyStates.keywords
  }

  get voice() {
    return this.#readonlyStates.voice
  }

  get isPersonReplace() {
    return this.#readonlyStates.isPersonReplace
  }

  get speechSpeed() {
    return this.#readonlyStates.speechSpeed
  }

  get autoNextSection() {
    return this.#readonlyStates.autoNextSection
  }

  get paragraphRepeat() {
    return this.#readonlyStates.paragraphRepeat
  }

  get pageList() {
    return this.#readonlyStates.pageList
  }

  get fontSize() {
    return this.#readonlyStates.fontSize
  }

  get disabledVertical() {
    return this.#readonlyStates.disabledVertical
  }

  get docVisible() {
    return document.visibilityState === 'visible'
  }

  get canManipulateDOM() {
    return this.docVisible || !isMobile
  }

  syncUIState<K extends keyof PlayerReadonlyStates>(
    name: K,
    state: PlayerReadonlyStates[K],
  ) {
    this.#readonlyStates[name] = state
    this.uiEvents.fire(name, state)
  }
}

export function usePlayerSync(
  player: Player,
  {
    setPos,
    setStarted,
    setActiveNavs,
    setLoading,
    setScrollPercent,
    setSelection,
  }: {
    setPos: Dispatch<BookTypes.PropertyPosition>
    setStarted: Dispatch<boolean>
    setActiveNavs: Dispatch<BookNav[]>
    setLoading: Dispatch<boolean>
    setScrollPercent: Dispatch<number | undefined>
    setSelection: Dispatch<BookTypes.PropertyRange | undefined>
  },
) {
  useEffect(() => {
    const events = player.states.events
    const disposes = [
      events.on('pos', (pos) => {
        setPos(pos)
      }),
      events.on('started', (started) => {
        setStarted(started)
      }),
      events.on('activeNavs', (activeNavs) => {
        setActiveNavs(activeNavs)
      }),
      events.on('loading', (loading) => {
        setLoading(loading)
      }),
      events.on('scrollPercent', (scrollPercent) => {
        setScrollPercent(scrollPercent)
      }),
      events.on('selection', (selection) => {
        setSelection(selection)
      }),
    ]
    return () => {
      disposes.forEach((dispose) => dispose())
    }
  }, [
    player,
    setPos,
    setStarted,
    setActiveNavs,
    setLoading,
    setScrollPercent,
    setSelection,
  ])
}

export function usePlayerUISync(
  player: Player,
  {
    annotations,
    keywords,
    isPersonReplace,
    speechSpeed,
    voice,
    autoNextSection,
    paragraphRepeat,
    pageList,
    fontSize,
    disabledVertical,
  }: PlayerReadonlyStates,
) {
  useEffect(() => {
    player.states.syncUIState('annotations', annotations)
  }, [player, annotations])

  useEffect(() => {
    player.states.syncUIState('keywords', keywords)
  }, [player, keywords])

  useEffect(() => {
    player.states.syncUIState('isPersonReplace', isPersonReplace)
  }, [player, isPersonReplace])

  useEffect(() => {
    player.states.syncUIState('speechSpeed', speechSpeed)
  }, [player, speechSpeed])

  useEffect(() => {
    player.states.syncUIState('voice', voice)
  }, [player, voice])

  useEffect(() => {
    player.states.syncUIState('autoNextSection', autoNextSection)
  }, [player, autoNextSection])

  useEffect(() => {
    player.states.syncUIState('paragraphRepeat', paragraphRepeat)
  }, [player, paragraphRepeat])

  useEffect(() => {
    player.states.syncUIState('pageList', pageList)
  }, [player, pageList])

  useEffect(() => {
    player.states.syncUIState('fontSize', fontSize)
  }, [player, fontSize])

  useEffect(() => {
    player.states.syncUIState('disabledVertical', disabledVertical)
  }, [player, disabledVertical])

  const isFirstSection = useMemo(
    () => player.isFirstSection,
    [player.isFirstSection],
  )
  const isLastSection = useMemo(
    () => player.isLastSection,
    [player.isLastSection],
  )
  const isFirstParagraph = useMemo(
    () => player.isFirstParagraph,
    [player.isFirstParagraph],
  )
  const isLastParagraph = useMemo(
    () => player.isLastParagraph,
    [player.isLastParagraph],
  )

  return { isFirstSection, isLastSection, isFirstParagraph, isLastParagraph }
}
