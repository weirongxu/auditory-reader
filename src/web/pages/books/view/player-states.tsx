import type { Dispatch } from 'react'
import { useMemo } from 'react'
import { useEffect } from 'react'
import type { BookNav } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'
import type { Player } from './player.js'

type PlayerStates = {
  started: boolean
  pos: BookTypes.PropertyPosition
  focusedNavs: Set<BookNav>
}

type PlayerStatesUpdateCallabck = (states: Partial<PlayerStates>) => void

export class PlayerStatesManager {
  #states: PlayerStates = {
    started: false,
    pos: { section: 0, paragraph: 0 },
    focusedNavs: new Set(),
  }

  voice: null | SpeechSynthesisVoice = null
  isPersonReplace = false
  speechSpeed = 1
  autoNextSection = false

  #onUpdateCallbacks: PlayerStatesUpdateCallabck[] = []

  onUpdate(callback: PlayerStatesUpdateCallabck) {
    this.#onUpdateCallbacks.push(callback)
    return () => {
      const idx = this.#onUpdateCallbacks.findIndex(() => callback)
      this.#onUpdateCallbacks.splice(idx, 1)
    }
  }

  #tiggerUpdated(states: Partial<PlayerStates>) {
    for (const cb of this.#onUpdateCallbacks) {
      cb(states)
    }
  }

  get started() {
    return this.#states.started
  }

  set started(started: boolean) {
    this.#states.started = started
    this.#tiggerUpdated({ started })
  }

  get pos() {
    return this.#states.pos
  }

  set pos(pos: BookTypes.PropertyPosition) {
    this.#states.pos = pos
    this.#tiggerUpdated({ pos })
  }

  set focusedNavs(focusedNavs: Set<BookNav>) {
    this.#states.focusedNavs = focusedNavs
    this.#tiggerUpdated({ focusedNavs })
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
    const dispose = player.states.onUpdate((states) => {
      if (states.pos !== undefined) setPos(states.pos)
      if (states.started !== undefined) setStarted(states.started)
      if (states.focusedNavs !== undefined) setFocusedNavs(states.focusedNavs)
    })
    return () => {
      dispose()
    }
  }, [player, setPos, setStarted, setFocusedNavs])
}

export function usePlayerSyncUI(
  player: Player,
  props: {
    isPersonReplace: boolean
    speechSpeed: number
    voice: SpeechSynthesisVoice
    autoNextSection: boolean
  }
) {
  const { isPersonReplace, speechSpeed, voice, autoNextSection } = props

  useEffect(() => {
    Object.assign(player.states, {
      isPersonReplace,
      speechSpeed,
      voice,
      autoNextSection,
    })
  }, [player, isPersonReplace, speechSpeed, voice, autoNextSection])

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
