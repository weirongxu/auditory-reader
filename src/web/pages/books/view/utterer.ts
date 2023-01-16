import { ZH_PERSON_RULES } from '../../../../core/consts.js'
import { findLastIndex } from '../../../../core/util/collection.js'
import { Highlight } from './highlight.js'
import type { Player } from './player'
import type { PlayerIframeController } from './player-iframe-controller.js'
import type { PlayerStatesManager } from './player-states'
import {
  nextPagePlay,
  pressEnterPlay,
  rainStart,
  rainStop,
  rewindPlay,
  shutterPlay,
} from './sound.js'
import type { ReadablePartText } from './types.js'

function replaceScan(
  text: string,
  match: string | RegExp,
  replace: string | ((source: string, index: number) => string)
): string {
  if (match instanceof RegExp && !match.global) {
    match = new RegExp(match.source, `${match.flags}g`)
  }
  if (replace instanceof Function) {
    let i = 0
    return text.toString().replaceAll(match, (source) => replace(source, i++))
  } else {
    return text.toString().replaceAll(match, replace)
  }
}

function replacePersonText(text: string): string {
  for (const [key, value] of Object.entries(ZH_PERSON_RULES)) {
    text = replaceScan(text, key, value)
  }
  return text
}

type QoutePostion = { type: 'start' | 'end'; charIndex: number }
function getQoutePostions(text: string): QoutePostion[] {
  const pos: QoutePostion[] = []
  for (const [i, m] of [...text.matchAll(/"|'/g)].entries()) {
    if (m.index === undefined) continue
    if (i % 2 === 0) {
      pos.push({
        type: 'start',
        charIndex: m.index,
      })
    } else {
      pos.push({
        type: 'end',
        charIndex: m.index,
      })
    }
  }
  for (const m of text.matchAll(/“|‘|「|『/g)) {
    if (m.index === undefined) continue
    pos.push({
      type: 'start',
      charIndex: m.index,
    })
  }
  for (const m of text.matchAll(/”|’|」|』/g)) {
    if (m.index === undefined) continue
    pos.push({
      type: 'end',
      charIndex: m.index,
    })
  }
  return pos.sort((a, b) => a.charIndex - b.charIndex)
}

type SpeakResult = 'cancel' | 'done'

const speakRetriedMax = 3

export class Utterer {
  hl: Highlight
  state: 'speaking' | 'none' | 'cancel' = 'none'
  states: PlayerStatesManager

  constructor(public player: Player, iframeCtrler: PlayerIframeController) {
    this.hl = new Highlight(iframeCtrler)
    this.states = player.states
  }

  cancel() {
    this.state = 'cancel'
    if (speechSynthesis.speaking) speechSynthesis.cancel()
  }

  async speak(node: ReadablePartText): Promise<SpeakResult> {
    const voice = this.states.voice
    const isPersonReplace = this.states.isPersonReplace
    const speechSpeed = this.states.speechSpeed

    if (!voice) return 'cancel'

    this.state = 'speaking'
    const utterance = new SpeechSynthesisUtterance()
    let text = node.text
    text = isPersonReplace ? replacePersonText(text) : text
    const quotePostions = getQoutePostions(text)
    utterance.text = text
    utterance.voice = voice
    utterance.rate = speechSpeed
    speechSynthesis.speak(utterance)
    utterance.addEventListener('boundary', (event: SpeechSynthesisEvent) => {
      // range highlight
      this.hl.highlight(node, event.charIndex, event.charLength)

      // quote & rain
      const quotePosIndex = findLastIndex(
        quotePostions,
        (p) => p.charIndex <= event.charIndex
      )
      if (quotePosIndex === undefined) return rainStop()
      const posPass = quotePostions.slice(0, quotePosIndex + 1)
      const startPosList = posPass.filter((p) => p.type === 'start')
      const endPosList = posPass.filter((p) => p.type === 'end')
      if (startPosList.length > endPosList.length) {
        rainStart()
      } else {
        rainStop()
      }
    })
    const result = await new Promise<SpeakResult>((resolve, reject) => {
      utterance.addEventListener(
        'end',
        () => {
          resolve(this.state === 'cancel' ? 'cancel' : 'done')
        },
        { once: true }
      )
      utterance.addEventListener(
        'error',
        (error) => {
          if (this.state === 'cancel') resolve('cancel')
          else reject(error)
        },
        { once: true }
      )
    })
    this.hl.highlightClear()
    rainStop()
    this.state = 'none'
    return result
  }

  private async nextPart() {
    // end of section
    if (
      this.states.pos.paragraph >=
      this.player.iframeCtrler.readableParts.length - 1
    ) {
      // next section
      if (
        this.states.pos.section < this.player.book.spines.length - 1 &&
        this.states.autoNextSection
      ) {
        await this.player.nextSection()
        await nextPagePlay()
      }
      // stop
      else {
        this.player.pause()
      }
    } else {
      // next paragraph
      await this.player.nextParagraph()
      await pressEnterPlay()
    }
  }

  async startLoop() {
    let retriedCount = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.states.started) return
      try {
        const node =
          this.player.iframeCtrler.readableParts[this.states.pos.paragraph]
        if (node) {
          if (node.type === 'text') {
            let isCancel = false
            for (let i = 0; i < this.states.paragraphRepeat; i++) {
              const ret = await this.speak(node)
              if (ret === 'cancel') {
                isCancel = true
                break
              } else if (i !== this.states.paragraphRepeat - 1) {
                await rewindPlay()
              }
            }
            // May pause, jumps to other paragraphs, leave page.
            // Continue is necessary, when the user jumps to other paragraphs
            if (isCancel) continue
          } else if (node.type === 'image') {
            await shutterPlay()
          }
        }

        await this.nextPart()
      } catch (err) {
        console.error(err)
        retriedCount += 1
        if (retriedCount > speakRetriedMax) {
          await this.nextPart()
          retriedCount = 0
        }
      }
    }
  }
}
