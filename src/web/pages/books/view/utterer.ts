import { findLastIndex } from '../../../../core/util/collection.js'
import { ZH_PERSON_RULES } from '../../../../core/consts.js'
import { Highlight } from './highlight.js'
import type { Player } from './player'
import type { PlayerStatesManager } from './player-states'
import { rainStop, rainStart, paragraphEndPlay } from './sound.js'
import type { ParagraphElemText } from './types'

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
  hl = new Highlight()
  state: 'speaking' | 'none' | 'cancel' = 'none'
  states: PlayerStatesManager

  constructor(public player: Player) {
    this.states = player.states
  }

  cancel() {
    this.state = 'cancel'
    if (speechSynthesis.speaking) speechSynthesis.cancel()
  }

  /**
   * @returns
   * - true: play finished
   * - false: cancel or play failed
   */
  async speak(node: ParagraphElemText): Promise<SpeakResult> {
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
          reject(error)
        },
        { once: true }
      )
    })
    this.hl.highlightClear()
    rainStop()
    this.state = 'none'
    return result
  }

  async startLoop() {
    let retriedCount = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.player.states.started) return
      try {
        const node =
          this.player.iframeCtrler.elemTexts[this.player.states.pos.paragraph]
        if (node) {
          const ret = await this.speak(node)
          // continue when cancel
          if (ret === 'cancel') continue
        }

        await paragraphEndPlay()

        // end of section
        if (
          this.states.pos.paragraph >=
          this.player.iframeCtrler.elemTexts.length - 1
        ) {
          // next section
          if (this.states.autoNextSection) await this.player.nextSection()
          // stop
          else this.player.pause()
          continue
        }

        // next paragraph
        await this.player.nextParagraph()
      } catch (err) {
        console.error(err)
        retriedCount += 1
        if (retriedCount > speakRetriedMax) break
      }
    }
  }
}