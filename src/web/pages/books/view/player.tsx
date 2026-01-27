import { useUnmountEffect } from '@react-hookz/web'
import type { RefObject } from 'react'
import { useState } from 'react'
import type { BookTypes } from '../../../../core/book/types.js'
import { SingleEmitter } from '../../../../core/util/emitter.js'
import { async } from '../../../../core/util/promise.js'
import type { BookView } from '../view.js'
import { PlayerAnnotations } from './player-annotations.js'
import {
  PlayerIframeController,
  usePlayerIframe,
} from './player-iframe-controller.js'
import { PlayerKeywords } from './player-keywords.js'
import { PlayerStatesManager } from './player-states.js'
import { Utterer } from './utterer.js'
import { nextPagePlay, pressEnterPlay } from './sound.js'

export class Player {
  states: PlayerStatesManager
  utterer: Utterer
  iframeCtrler: PlayerIframeController
  annotations: PlayerAnnotations
  keywords: PlayerKeywords
  unmount = new SingleEmitter<void>({ once: true })

  constructor(
    public book: BookView,
    initPos: BookTypes.PropertyPosition,
    iframeRef: RefObject<HTMLIFrameElement>,
  ) {
    this.states = new PlayerStatesManager()
    this.states.pos = initPos
    this.iframeCtrler = new PlayerIframeController(this, this.states, iframeRef)
    this.utterer = new Utterer(this, this.states, this.iframeCtrler)
    this.annotations = new PlayerAnnotations(this)
    this.keywords = new PlayerKeywords(this)

    const onVisibilityChange = () => {
      // TODO
      // if (document.visibilityState === 'visible') this.reload()
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
    this.unmount.on(() => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      startedDispose()
    })
  }

  start() {
    this.states.started = true
    this.utterer.startLoop()
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

  async gotoPos({
    section,
    paragraph,
    scrollToParagraph = true,
    animated = true,
  }: {
    section?: number
    paragraph?: number
    scrollToParagraph?: boolean
    animated?: boolean
  }) {
    if (
      section !== undefined &&
      (section < 0 || section >= this.book.spines.length)
    )
      return

    section ??= this.states.pos.section
    paragraph ??= this.states.pos.paragraph

    if (
      this.states.pos.section === section &&
      this.states.pos.paragraph === paragraph
    )
      // Skip when same position
      return

    const stored = await this.utterer.suspend()
    if (this.states.pos.section === section) {
      // Same section
      await pressEnterPlay()
      this.states.pos = {
        section,
        paragraph,
      }
      if (scrollToParagraph)
        await this.iframeCtrler.scrollToCurParagraph(animated)
    } else {
      // Change section
      await nextPagePlay()
      await this.iframeCtrler.load({
        section,
        paragraph,
        animated,
      })
    }
    this.utterer.resume(stored)
  }

  async gotoSection(section: number, paragraph: number) {
    await this.gotoPos({ section, paragraph })
  }

  async prevSection(paragraph = 0) {
    await this.gotoPos({
      section: this.states.pos.section - 1,
      paragraph,
      animated: false,
    })
  }

  async nextSection(paragraph = 0) {
    await this.gotoPos({
      section: this.states.pos.section + 1,
      paragraph,
      animated: false,
    })
  }

  async gotoUrlPath(urlPath: string) {
    const stored = await this.utterer.suspend()
    await this.iframeCtrler.gotoUrlPath(urlPath)
    this.utterer.resume(stored)
  }

  get isFirstPage() {
    return this.iframeCtrler.isFirstPageList
  }

  get isLastPage() {
    return this.iframeCtrler.isLastPageList
  }

  async gotoPage(pageIndex: number, jump: boolean) {
    await this.iframeCtrler.pageListScrollToPage(pageIndex, jump)
  }

  async prevPage(count: number, jump: boolean) {
    await this.iframeCtrler.pageListPushAdjust(-count, jump)
  }

  async nextPage(count: number, jump: boolean) {
    await this.iframeCtrler.pageListPushAdjust(count, jump)
  }

  get isFirstParagraph() {
    return this.states.pos.paragraph <= 0
  }

  get isLastParagraph() {
    return (
      this.states.pos.paragraph >= this.iframeCtrler.readableParts.length - 1
    )
  }

  async gotoParagraph(paragraph: number, scrollToParagraph = true) {
    await this.gotoPos({ paragraph, scrollToParagraph })
  }

  async prevParagraph(scrollToParagraph = true) {
    if (this.states.pos.paragraph === 0) await this.prevSection(-1)
    else
      await this.gotoParagraph(this.states.pos.paragraph - 1, scrollToParagraph)
  }

  async nextParagraph(scrollToParagraph = true) {
    if (this.states.pos.paragraph >= this.iframeCtrler.readableParts.length - 1)
      await this.nextSection()
    else
      await this.gotoParagraph(this.states.pos.paragraph + 1, scrollToParagraph)
  }
}

export function useCreatePlayer(
  book: BookView,
  pos: BookTypes.PropertyPosition,
  iframeRef: RefObject<HTMLIFrameElement>,
) {
  const [player] = useState(() => new Player(book, pos, iframeRef))

  useUnmountEffect(() => {
    player.unmount.fire()
    player.pause()
  })

  useUnmountEffect(() => {
    player.pause()
  })

  usePlayerIframe(player)
  return player
}
