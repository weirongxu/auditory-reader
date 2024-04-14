import { rainStart, rainStop } from '../../web/pages/books/view/sound.js'
import type { TextAlias } from '../../web/pages/books/view/types.js'
import { ZH_PERSON_RULES } from '../consts.js'
import { findLast, findLastIndex, orderBy, range } from './collection.js'

type AliasResult = {
  text: string
  highlightOffsets: [index: number, accOffset: number][]
}

type HighlightEvent = {
  charIndex: number
  charLength: number
}

export type SpeakResult = 'cancel' | 'done'

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
    pos.push({
      type: 'start',
      charIndex: m.index,
    })
  }
  for (const m of text.matchAll(/”|’|」|』/g)) {
    pos.push({
      type: 'end',
      charIndex: m.index,
    })
  }
  return orderBy(pos, 'asc', (p) => p.charIndex)
}

export class Speech {
  public utterance: SpeechSynthesisUtterance
  public state: 'speaking' | 'none' | 'cancel' = 'none'

  constructor() {
    this.utterance = new SpeechSynthesisUtterance()
  }

  private aliasReplace(text: string, aliasArray: TextAlias[]): AliasResult {
    if (!aliasArray.length)
      return {
        text,
        highlightOffsets: [],
      }

    const highlightOffsets: [index: number, accOffset: number][] = []
    const indexMap = new Map<number, TextAlias>()
    for (const alias of aliasArray) {
      let i = -1
      // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
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

  cancel() {
    this.state = 'cancel'
    if (speechSynthesis.speaking) speechSynthesis.cancel()
  }

  async speak(
    text: string,
    {
      speed,
      voice,
      isPersonReplace,
      quote = true,
      alias,
      onBoundary,
    }: {
      speed: number
      voice: SpeechSynthesisVoice
      isPersonReplace: boolean
      quote?: boolean
      alias?: TextAlias[]
      onBoundary?: (event: HighlightEvent) => void
    },
  ) {
    this.state = 'speaking'
    text = isPersonReplace ? replacePersonText(text) : text

    // boundary
    const boundaryListeners: ((event: SpeechSynthesisEvent) => void)[] = []

    if (quote) {
      const quotePostions = getQoutePostions(text)
      boundaryListeners.push((event: SpeechSynthesisEvent) => {
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
      })
    }

    if (onBoundary)
      if (alias && alias.length) {
        const aliasResult = this.aliasReplace(text, alias)
        text = aliasResult.text

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
                const charIndex = event.charIndex + (startOffset.at(1) ?? 0)
                const charLength =
                  charEndIndex + (endOffset.at(1) ?? 0) - charIndex
                return {
                  charIndex,
                  charLength,
                }
              }
            : (event) => event

        boundaryListeners.push((event: SpeechSynthesisEvent) => {
          onBoundary(highlightOffsetFn(event))
        })
      } else {
        boundaryListeners.push((event: SpeechSynthesisEvent) => {
          onBoundary(event)
        })
      }

    for (const boundaryListener of boundaryListeners) {
      this.utterance.addEventListener('boundary', boundaryListener)
    }

    this.utterance.rate = speed
    this.utterance.voice = voice
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

    for (const boundaryListener of boundaryListeners) {
      this.utterance.removeEventListener('boundary', boundaryListener)
    }
    rainStop()
    this.state = 'none'
    return result
  }
}
