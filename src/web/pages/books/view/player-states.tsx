import type { Dispatch } from 'react'
import { useEffect, useMemo } from 'react'
import type { BookNav } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { Emitter } from '../../../../core/util/emitter.js'
import type { Player } from './player.js'

type PlayerStates = {
  started: boolean
  pos: BookTypes.PropertyPosition
  focusedNavs: Set<BookNav>
}

type PlayerUIStates = {
  isPersonReplace: boolean
  speechSpeed: number
  voice: null | SpeechSynthesisVoice
  autoNextSection: boolean
  paragraphRepeat: number
}

export class PlayerStatesManager {
  #states: PlayerStates = {
    started: false,
    pos: { section: 0, paragraph: 0 },
    focusedNavs: new Set(),
  }

  events = new Emitter<PlayerStates>()

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

  set focusedNavs(focusedNavs: Set<BookNav>) {
    this.#states.focusedNavs = focusedNavs
    this.events.fire('focusedNavs', focusedNavs)
  }

  #uiStates: PlayerUIStates = {
    voice: null,
    isPersonReplace: false,
    speechSpeed: 1,
    autoNextSection: false,
    paragraphRepeat: 1,
  }

  uiEvents = new Emitter<PlayerUIStates>()

  get voice() {
    return this.#uiStates.voice
  }

  get isPersonReplace() {
    return this.#uiStates.isPersonReplace
  }

  get speechSpeed() {
    return this.#uiStates.speechSpeed
  }

  get autoNextSection() {
    return this.#uiStates.autoNextSection
  }

  get paragraphRepeat() {
    return this.#uiStates.paragraphRepeat
  }

  syncUIState<K extends keyof PlayerUIStates>(
    name: K,
    state: PlayerUIStates[K]
  ) {
    this.#uiStates[name] = state
    this.uiEvents.fire(name, state)
  }
}

export function usePlayerSync(
  player: Player,
  props: {
    setPos: Dispatch<BookTypes.PropertyPosition>
    setStarted: Dispatch<boolean>
    setFocusedNavs: Dispatch<Set<BookNav>>
  }
) {
  const { setPos, setStarted, setFocusedNavs } = props

  useEffect(() => {
    const events = player.states.events
    const disposes = [
      events.on('pos', (pos) => {
        setPos(pos)
      }),
      events.on('started', (started) => {
        setStarted(started)
      }),
      events.on('focusedNavs', (focusedNavs) => {
        setFocusedNavs(focusedNavs)
      }),
    ]
    return () => {
      disposes.forEach((dispose) => dispose())
    }
  }, [player, setPos, setStarted, setFocusedNavs])
}

export function usePlayerSyncUI(player: Player, props: PlayerUIStates) {
  const {
    isPersonReplace,
    speechSpeed,
    voice,
    autoNextSection,
    paragraphRepeat,
  } = props

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

  const isFirstSection = useMemo(
    () => player.isFirstSection,
    [player.isFirstSection]
  )
  const isLastSection = useMemo(
    () => player.isLastSection,
    [player.isLastSection]
  )
  const isFirstParagraph = useMemo(
    () => player.isFirstParagraph,
    [player.isFirstParagraph]
  )
  const isLastParagraph = useMemo(
    () => player.isLastParagraph,
    [player.isLastParagraph]
  )

  return { isFirstSection, isLastSection, isFirstParagraph, isLastParagraph }
}
