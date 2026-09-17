import type { HighlightEvent } from '../../../../core/tts/types.js'
import { findLastIndex, orderBy } from '../../../../core/util/collection.js'

type QuotePosition = { type: 'start' | 'end'; charIndex: number }

function getQuotePositions(text: string): QuotePosition[] {
  const pos: QuotePosition[] = []
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

export function createQuoteRainListener(
  text: string,
  rain: { start: () => void; stop: () => void },
): (event: HighlightEvent) => void {
  const quotePositions = getQuotePositions(text)
  return (event: HighlightEvent) => {
    const quotePosIndex = findLastIndex(
      quotePositions,
      (p) => p.charIndex <= event.charIndex,
    )
    if (quotePosIndex === undefined) {
      rain.stop()
      return
    }
    const posPass = quotePositions.slice(0, quotePosIndex + 1)
    const startPosList = posPass.filter((p) => p.type === 'start')
    const endPosList = posPass.filter((p) => p.type === 'end')
    if (startPosList.length > endPosList.length) {
      rain.start()
    } else {
      rain.stop()
    }
  }
}
