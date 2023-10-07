import { ZH_PERSON_RULES } from '../../../../core/consts.js'
import {
  findLast,
  findLastIndex,
  orderBy,
  range,
} from '../../../../core/util/collection.js'
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
import type { ReadablePartText, TextAlias } from './types.js'

function replacePersonText(text: string): string {
  for (const [key, value] of Object.entries(ZH_PERSON_RULES)) {
    text = text.replaceAll(key, value.word)
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
  return orderBy(pos, 'asc', (p) => p.charIndex)
}

type AliasResult = {
  text: string
  highlightOffsets: [index: number, accOffset: number][]
}

type SpeakResult = 'cancel' | 'done'

const speakRetriedMax = 3

export class Utterer {
  hl: Highlight
  state: 'speaking' | 'none' | 'cancel' = 'none'
  states: PlayerStatesManager
  utterance: SpeechSynthesisUtterance

  constructor(
    public player: Player,
    states: PlayerStatesManager,
    iframeCtrler: PlayerIframeController,
  ) {
    this.states = states
    this.hl = new Highlight(iframeCtrler, states)

    this.utterance = new SpeechSynthesisUtterance()
    this.states.uiEvents.on('voice', (voice) => {
      this.utterance.voice = voice
    })
    this.states.uiEvents.on('speechSpeed', (speechSpeed) => {
      this.utterance.rate = speechSpeed
    })
  }

  cancel() {
    this.state = 'cancel'
    if (speechSynthesis.speaking) speechSynthesis.cancel()
  }

  private aliasReplace(text: string): AliasResult {
    if (!this.player.iframeCtrler.alias.length)
      return {
        text,
        highlightOffsets: [],
      }

    const highlightOffsets: [index: number, accOffset: number][] = []
    const indexMap = new Map<number, TextAlias>()
    for (const alias of this.player.iframeCtrler.alias) {
      let i = -1
      // eslint-disable-next-line no-constant-condition
      while (true) {
        i = text.indexOf(alias.source, i + 1)
        if (i === -1) break
        else if (!indexMap.has(i)) {
          indexMap.set(i, alias)
        }
      }
    }
    const orderedIndexes = orderBy([...indexMap.entries()], 'asc', ([i]) => i)
    let accOffset = 0
    for (const [i, { source, target }] of orderedIndexes) {
      text = text.replace(source, target)
      const unitOffset = source.length - target.length
      if (unitOffset === 0) continue
      const afterI = i - accOffset
      highlightOffsets.push([afterI, accOffset])
      for (const j of range(1, target.length)) {
        highlightOffsets.push([
          afterI + j,
          accOffset + Math.floor(unitOffset * (j / target.length)),
        ])
      }
      accOffset = accOffset + unitOffset
    }
    return { text, highlightOffsets }
  }

  async speakNode(node: ReadablePartText): Promise<SpeakResult> {
    return this.speakText(node.text, {
      onAlias: (aliasResult) => {
        type HighlightEvent = {
          charIndex: number
          charLength: number
        }

        const highlightOffsetTable = aliasResult.highlightOffsets

        const highlightOffsetFn: (event: HighlightEvent) => HighlightEvent =
          highlightOffsetTable.length
            ? (event) => {
                const startOffset = findLast(
                  highlightOffsetTable,
                  ([i]) => i <= event.charIndex,
                )
                if (!startOffset) return event
                const charEndIndex = event.charIndex + event.charLength
                const endOffset = findLast(
                  highlightOffsetTable,
                  ([i]) => i <= charEndIndex,
                )
                if (!endOffset) return event
                const charIndex = event.charIndex + (startOffset[1] ?? 0)
                const charLength =
                  charEndIndex + (endOffset[1] ?? 0) - charIndex
                return {
                  charIndex,
                  charLength,
                }
              }
            : (event) => event

        const boundaryListener = (event: SpeechSynthesisEvent) => {
          const { charIndex: highlightIndex, charLength: highlightLength } =
            highlightOffsetFn(event)

          // range highlight
          this.hl.highlight(node, highlightIndex, highlightLength)
        }

        this.utterance.addEventListener('boundary', boundaryListener)

        return () => {
          this.utterance.removeEventListener('boundary', boundaryListener)
        }
      },
    })
  }

  async speakText(
    text: string,
    { onAlias }: { onAlias?: (aliasResult: AliasResult) => () => void } = {},
  ): Promise<SpeakResult> {
    this.state = 'speaking'
    text = this.states.isPersonReplace ? replacePersonText(text) : text

    // alias
    const aliasResult = this.aliasReplace(text)
    text = aliasResult.text

    const disposeOnAlias = onAlias?.(aliasResult)

    const quotePostions = getQoutePostions(text)

    // boundary
    const boundaryListener = (event: SpeechSynthesisEvent) => {
      // quote & rain
      const quotePosIndex = findLastIndex(
        quotePostions,
        (p) => p.charIndex <= event.charIndex,
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
    }
    this.utterance.addEventListener('boundary', boundaryListener)

    this.utterance.text = text
    speechSynthesis.speak(this.utterance)

    const result = await new Promise<SpeakResult>((resolve, reject) => {
      this.utterance.addEventListener(
        'end',
        () => {
          resolve(this.state === 'cancel' ? 'cancel' : 'done')
        },
        { once: true },
      )
      this.utterance.addEventListener(
        'error',
        (error) => {
          if (this.state === 'cancel') resolve('cancel')
          else reject(error)
        },
        { once: true },
      )
    })

    disposeOnAlias?.()
    this.utterance.removeEventListener('boundary', boundaryListener)
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
        const node = this.player.iframeCtrler.readableParts.at(
          this.states.pos.paragraph,
        )
        if (node) {
          if (node.type === 'text') {
            let isCancel = false
            for (let i = 0; i < this.states.paragraphRepeat; i++) {
              const ret = await this.speakNode(node)
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
