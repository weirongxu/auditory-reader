import { useUnmountEffect } from '@react-hookz/web'
import type { RefObject } from 'react'
import { useRef } from 'react'
import type { BookViewRes } from '../../../../core/api/books/view.js'
import type { BookTypes } from '../../../../core/book/types.js'
import { PlayerIframeController } from './player-iframe-controller.js'
import { PlayerStatesManager } from './player-states.js'
import { Utterer } from './utterer.js'

export class Player {
  states: PlayerStatesManager
  utterer: Utterer
  iframeCtrler: PlayerIframeController

  constructor(
    public book: BookViewRes,
    initPos: BookTypes.PropertyPosition,
    iframeRef: RefObject<HTMLIFrameElement>
  ) {
    this.states = new PlayerStatesManager()
    this.states.pos = initPos
    this.iframeCtrler = new PlayerIframeController(this, iframeRef)
    this.utterer = new Utterer(this, this.iframeCtrler)
  }

  #onUnmountCallbacks: (() => void)[] = []
  onUnmount(callback: () => void) {
    this.#onUnmountCallbacks.push(callback)
  }

  triggerUnmount() {
    for (const callback of this.#onUnmountCallbacks) {
      callback()
    }
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

  private async checkAndGotoPos(to: { section?: number; paragraph?: number }) {
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
      await this.iframeCtrler.scrollToPos()
    } else {
      // Change section
      const href = this.book.spines[section]?.href
      if (!href) {
        return
      }

      await this.iframeCtrler.loadByUrl(href)

      // new paragraph
      let paragraph = to.paragraph ?? 0
      if (paragraph < 0)
        paragraph = this.iframeCtrler.readableParts.length + paragraph
      if (
        this.iframeCtrler.readableParts.length &&
        (paragraph < 0 || paragraph >= this.iframeCtrler.readableParts.length)
      )
        return

      this.states.pos = {
        section,
        paragraph,
      }
      await this.iframeCtrler.scrollToPos()
    }

    this.utterer.cancel()
  }

  async prevSection() {
    await this.checkAndGotoPos({ section: this.states.pos.section - 1 })
  }

  async nextSection() {
    await this.checkAndGotoPos({ section: this.states.pos.section + 1 })
  }

  async gotoUrl(url: string) {
    await this.iframeCtrler.gotoUrlAndScroll(url)
    this.utterer.cancel()
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
    if (this.states.pos.paragraph === 0)
      await this.checkAndGotoPos({
        section: this.states.pos.section - 1,
        paragraph: -1,
      })
    else await this.gotoParagraph(this.states.pos.paragraph - 1)
  }

  async nextParagraph() {
    if (this.states.pos.paragraph >= this.iframeCtrler.readableParts.length - 1)
      await this.checkAndGotoPos({
        section: this.states.pos.section + 1,
        paragraph: 0,
      })
    else await this.gotoParagraph(this.states.pos.paragraph + 1)
  }
}

export function usePlayer(
  book: BookViewRes,
  pos: BookTypes.PropertyPosition,
  iframeRef: RefObject<HTMLIFrameElement>
) {
  const player = useRef<Player>()
  if (!player.current) {
    player.current = new Player(book, pos, iframeRef)
  }
  useUnmountEffect(() => {
    player.current?.triggerUnmount()
  })
  return player.current
}
