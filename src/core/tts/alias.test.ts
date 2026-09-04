import { describe, expect, it } from 'vitest'

import { aliasReplace } from './alias.js'

describe('aliasReplace', () => {
  it('returns text unchanged without aliases', () => {
    expect(aliasReplace('hello', [])).toEqual({
      text: 'hello',
      highlightOffsets: [],
    })
  })

  it('replaces aliases and remaps highlight offsets', () => {
    const result = aliasReplace('abc def abc', [
      { source: 'abc', target: 'xy' },
    ])
    expect(result.text).toBe('xy def xy')
    // 'abc'(3) -> 'xy'(2): offsets accumulate -1 per char of the target
    expect(result.highlightOffsets.length).toBe(4)
    expect(result.highlightOffsets[0]).toEqual([0, 0])
    expect(result.highlightOffsets.at(-1)).toEqual([8, 1])
  })

  it('ignores aliases with equal source/target length', () => {
    const result = aliasReplace('abc', [{ source: 'abc', target: 'xyz' }])
    expect(result.text).toBe('xyz')
    expect(result.highlightOffsets).toEqual([])
  })
})
