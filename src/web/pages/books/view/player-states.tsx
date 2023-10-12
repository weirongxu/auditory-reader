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
}

type PlayerReadonlyStates = {
  bookmarks: BookTypes.PropertyBookmark[] | undefined
  isPersonReplace: boolean
  speechSpeed: number
  voice: null | SpeechSynthesisVoice
  autoNextSection: boolean
  paragraphRepeat: number
  pageList: PageListType
  fontSize: number
}

export class PlayerStatesManager {
  #states: PlayerStates = {
    started: false,
    pos: { section: 0, paragraph: 0 },
    activeNavs: [],
    loading: false,
    scrollPercent: undefined,
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

  #readonlyStates: PlayerReadonlyStates = {
    bookmarks: [],
    isPersonReplace: false,
    speechSpeed: 1,
    voice: null,
    autoNextSection: false,
    paragraphRepeat: 1,
    pageList: 'double',
    fontSize: 16,
  }

  uiEvents = new ChangedEmitter<PlayerReadonlyStates>()

  get bookmarks() {
    return this.#readonlyStates.bookmarks
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
  }: {
    setPos: Dispatch<BookTypes.PropertyPosition>
    setStarted: Dispatch<boolean>
    setActiveNavs: Dispatch<BookNav[]>
    setLoading: Dispatch<boolean>
    setScrollPercent: Dispatch<number | undefined>
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
    ]
    return () => {
      disposes.forEach((dispose) => dispose())
    }
  }, [player, setPos, setStarted, setActiveNavs, setLoading, setScrollPercent])
}

export function usePlayerUISync(
  player: Player,
  {
    bookmarks,
    isPersonReplace,
    speechSpeed,
    voice,
    autoNextSection,
    paragraphRepeat,
    pageList,
    fontSize,
  }: PlayerReadonlyStates,
) {
  useEffect(() => {
    player.states.syncUIState('bookmarks', bookmarks)
  }, [player, bookmarks])

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
