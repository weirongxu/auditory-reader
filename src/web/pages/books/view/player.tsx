import { useUnmountEffect } from '@react-hookz/web'
import type { RefObject } from 'react'
import { useRef } from 'react'
import type { BookView } from '../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { async } from '../../../../core/util/promise.js'
import {
  PlayerIframeController,
  usePlayerIframe,
} from './player-iframe-controller.js'
import { PlayerStatesManager } from './player-states.js'
import { Utterer } from './utterer.js'

export class Player {
  states: PlayerStatesManager
  utterer: Utterer
  iframeCtrler: PlayerIframeController

  constructor(
    public book: BookView,
    initPos: BookTypes.PropertyPosition,
    iframeRef: RefObject<HTMLIFrameElement>,
  ) {
    this.states = new PlayerStatesManager()
    this.states.pos = initPos
    this.iframeCtrler = new PlayerIframeController(this, this.states, iframeRef)
    this.utterer = new Utterer(this, this.states, this.iframeCtrler)

    const onVisibilityChange = () => {
      async(async () => {
        // wakeLock
        let lock: WakeLockSentinel | undefined
        await lock?.release().catch(console.error)
        lock = undefined
        if (this.states.started && this.states.docVisible) {
          lock = await navigator.wakeLock.request('screen')
        }
      })
    }
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    const startedDispose = this.states.events.on('started', onVisibilityChange)
    this.onUnmount(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      startedDispose()
    })
  }

  #onUnmountCallbacks: (() => void)[] = []
  onUnmount(callback: () => void) {
    this.#onUnmountCallbacks.push(callback)
  }

  triggerUnmount() {
    for (const callback of this.#onUnmountCallbacks) {
      callback()
    }
    this.#onUnmountCallbacks = []
  }

  start() {
    this.states.started = true
    this.utterer.startLoop().catch(console.error)
  }

  pause() {
    this.states.started = false
    this.utterer.cancel()
  }

  restart(delay?: number) {
    this.pause()
    if (delay)
      setTimeout(() => {
        this.start()
      }, delay)
    else this.start()
  }

  toggle() {
    if (this.states.started) this.pause()
    else this.start()
  }

  get isFirstSection() {
    return this.states.pos.section === 0
  }

  get isLastSection() {
    return this.states.pos.section === this.book.spines.length - 1
  }

  private async checkAndGotoPos(to: {
    section?: number
    paragraph?: number
    animated?: boolean
  }) {
    if (
      to.section !== undefined &&
      (to.section < 0 || to.section >= this.book.spines.length)
    )
      return

    const section = to.section ?? this.states.pos.section
    const paragraph = to.paragraph ?? this.states.pos.paragraph

    if (this.states.pos.section === section) {
      // Same section

      if (this.states.pos.paragraph === paragraph)
        // Skip when same position
        return

      this.states.pos = {
        section,
        paragraph: to.paragraph ?? this.states.pos.paragraph,
      }
      await this.iframeCtrler.scrollToCurParagraph(to.animated)
    } else {
      // Change section
      await this.iframeCtrler.loadByPos({
        section,
        paragraph: to.paragraph,
        animated: to.animated,
      })
    }

    this.utterer.cancel()
  }

  async gotoSection(section: number, paragraph: number) {
    await this.checkAndGotoPos({ section, paragraph })
  }

  async prevSection(paragraph = 0) {
    await this.checkAndGotoPos({
      section: this.states.pos.section - 1,
      paragraph,
      animated: false,
    })
  }

  async nextSection(paragraph = 0) {
    await this.checkAndGotoPos({
      section: this.states.pos.section + 1,
      paragraph,
      animated: false,
    })
  }

  async gotoUrlPath(urlPath: string) {
    await this.iframeCtrler.gotoUrlPath(urlPath)
    this.utterer.cancel()
  }

  get isFirstPage() {
    return this.iframeCtrler.isFirstPageList
  }

  get isLastPage() {
    return this.iframeCtrler.isLastPageList
  }

  async prevPage(count: number, jump: boolean) {
    await this.iframeCtrler.pushPageListAdjust(-count, jump)
  }

  async nextPage(count: number, jump: boolean) {
    await this.iframeCtrler.pushPageListAdjust(count, jump)
  }

  get isFirstParagraph() {
    return this.states.pos.paragraph === 0
  }

  get isLastParagraph() {
    return (
      this.states.pos.paragraph === this.iframeCtrler.readableParts.length - 1
    )
  }

  async gotoParagraph(paragraph: number) {
    await this.checkAndGotoPos({ paragraph })
  }

  async prevParagraph() {
    if (this.states.pos.paragraph === 0) await this.prevSection(-1)
    else await this.gotoParagraph(this.states.pos.paragraph - 1)
  }

  async nextParagraph() {
    if (this.states.pos.paragraph >= this.iframeCtrler.readableParts.length - 1)
      await this.nextSection()
    else await this.gotoParagraph(this.states.pos.paragraph + 1)
  }
}

export function usePlayer(
  book: BookView,
  pos: BookTypes.PropertyPosition,
  iframeRef: RefObject<HTMLIFrameElement>,
) {
  const player = useRef<Player>()
  if (!player.current) {
    player.current = new Player(book, pos, iframeRef)
  }
  useUnmountEffect(() => {
    player.current?.triggerUnmount()
  })
  usePlayerIframe(player.current)
  return player.current
}
