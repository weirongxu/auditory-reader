import { describe, expect, it } from 'vitest'

import { createQuoteRainListener } from './utterer-quote.js'

function createRecordingRain() {
  const calls: string[] = []
  return {
    calls,
    rain: {
      start: () => {
        calls.push('start')
      },
      stop: () => {
        calls.push('stop')
      },
    },
  }
}

describe('createQuoteRainListener', () => {
  it('stops rain before any quote position', () => {
    const text = 'a "quote" b'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 1, charLength: 1 })

    expect(calls).toEqual(['stop'])
  })

  it('starts rain inside an ASCII double quote and stops after', () => {
    const text = 'a "quote" b'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 3, charLength: 1 })
    listener({ charIndex: 9, charLength: 1 })

    expect(calls).toEqual(['start', 'stop'])
  })

  it('handles ASCII single quotes', () => {
    const text = "a 'quote' b"
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 4, charLength: 1 })
    listener({ charIndex: 9, charLength: 1 })

    expect(calls).toEqual(['start', 'stop'])
  })

  it('handles CJK quotes', () => {
    const text = '前「本文」後'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 2, charLength: 1 })
    listener({ charIndex: 4, charLength: 1 })

    expect(calls).toEqual(['start', 'stop'])
  })

  it('reflects nesting depth unconditionally (sound layer dedups)', () => {
    const text = 'outer "inner \'nested\' more" end'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 6, charLength: 1 }) // outer "
    listener({ charIndex: 13, charLength: 1 }) // inner '
    listener({ charIndex: 20, charLength: 1 }) // inner '
    listener({ charIndex: 26, charLength: 1 }) // outer "

    expect(calls).toEqual(['start', 'stop', 'start', 'stop'])
  })

  it('stops at text end outside quotes', () => {
    const text = 'a "quote" b'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 3, charLength: 1 })
    listener({ charIndex: 11, charLength: 0 })

    expect(calls).toEqual(['start', 'stop'])
  })

  it('stops immediately for text without quotes', () => {
    const text = 'no quotes here'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 0, charLength: 1 })
    listener({ charIndex: 14, charLength: 0 })

    expect(calls).toEqual(['stop', 'stop'])
  })

  it('treats unbalanced quotes by parity', () => {
    const text = 'odd " quote'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 5, charLength: 1 })

    expect(calls).toEqual(['start'])
  })

  it('handles unmatched CJK open quote', () => {
    const text = '前「本文'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 0, charLength: 1 }) // before open quote
    listener({ charIndex: 1, charLength: 1 }) // at open quote
    listener({ charIndex: 3, charLength: 1 }) // after open quote

    expect(calls).toEqual(['stop', 'start', 'start'])
  })

  it('mixes ASCII and CJK quotes ordered by charIndex', () => {
    const text = 'a "混" b'
    const { calls, rain } = createRecordingRain()
    const listener = createQuoteRainListener(text, rain)

    listener({ charIndex: 3, charLength: 1 })
    listener({ charIndex: 5, charLength: 1 })

    expect(calls).toEqual(['start', 'stop'])
  })
})
