import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest'

import type { SpeakParamsInput, TimelineEntry } from '../../core/tts/types.js'
import { cachedSpeak, cacheGet, cachePut, speakCacheKey } from './cache.js'
import type { SpeakEnvelope } from './envelope.js'
import {
  failNextIdbOperation,
  hasEntry,
  seedEntry,
  stubIdb,
} from './testing/idb-stub.js'

// getDB checks indexedDB availability at call time (before memoizing), so a
// single module instance works for both scenarios: stubIdb() also restores
// the fake globals after the no-idb describe stubs indexedDB to undefined.
stubIdb()

const base: SpeakParamsInput = {
  providerId: 'kokoro',
  voiceId: '0',
  text: 'hello',
  speed: 1,
}

const entry = (text = 'audio'): SpeakEnvelope => ({
  audio: new Blob([text], { type: 'audio/mpeg' }),
  timeline: [{ charIndex: 0, charLength: 1, startTime: 0, endTime: 0.1 }],
})

describe('cache without indexedDB', () => {
  beforeEach(() => {
    vi.stubGlobal('indexedDB', undefined)
  })

  afterEach(() => {
    stubIdb()
  })

  it('cacheGet rejects with the availability error', async () => {
    await expect(cacheGet('key')).rejects.toThrow('indexeddb is not available')
  })

  it('cachePut rejects with the availability error', async () => {
    await expect(
      cachePut('key', {
        audio: new Blob(['x']),
        timeline: [],
      }),
    ).rejects.toThrow('indexeddb is not available')
  })

  it('cachedSpeak rejects with the availability error', async () => {
    const synthesize = vi.fn(async () => ({
      audio: new Blob(['x']),
      timeline: [],
    }))
    await expect(cachedSpeak(base, synthesize)).rejects.toThrow(
      'indexeddb is not available',
    )
    expect(synthesize).not.toHaveBeenCalled()
  })

  it('speakCacheKey still computes a key', async () => {
    await expect(speakCacheKey(base)).resolves.toMatch(/^[0-9a-f]{40}$/)
  })
})

describe('speakCacheKey', () => {
  it('returns a stable 40-char hex sha1 for known params', async () => {
    const key = await speakCacheKey(base)
    expect(key).toMatch(/^[0-9a-f]{40}$/)

    const raw = [base.providerId, base.voiceId, '1', base.text].join('|')
    const digest = await crypto.subtle.digest(
      'SHA-1',
      new TextEncoder().encode(raw),
    )
    const expected = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
    expect(key).toBe(expected)
  })

  it('differs for different params', async () => {
    const other = await speakCacheKey({ ...base, speed: 2 })
    expect(other).not.toBe(await speakCacheKey(base))
  })
})

describe('cachedSpeak', () => {
  it('serves the second identical call from cache without synthesizing', async () => {
    const synthesize = vi.fn(async () => entry())
    const first = await cachedSpeak(base, synthesize)
    const second = await cachedSpeak(base, synthesize)
    expect(synthesize).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
    expect(await second.audio.text()).toBe('audio')
  })

  it('dedupes concurrent identical calls into one synthesis', async () => {
    let release: ((value: SpeakEnvelope) => void) | undefined
    const gate = new Promise<SpeakEnvelope>((resolve) => {
      release = resolve
    })
    const synthesize = vi.fn(() => gate)
    const results = Promise.all([
      cachedSpeak({ ...base, text: 'dedupe' }, synthesize),
      cachedSpeak({ ...base, text: 'dedupe' }, synthesize),
      cachedSpeak({ ...base, text: 'dedupe' }, synthesize),
    ])
    // Let the flight start before resolving the gated synthesis.
    await new Promise((resolve) => setTimeout(resolve, 0))
    const value = entry('shared')
    if (!release) throw new Error('synthesize was never called')
    release(value)
    const settled = await results
    expect(synthesize).toHaveBeenCalledTimes(1)
    for (const result of settled) {
      expect(result).toBe(value)
    }
  })

  it('propagates rejection and does not poison the mutex', async () => {
    const synthesize = vi
      .fn<() => Promise<SpeakEnvelope>>()
      .mockRejectedValueOnce(new Error('synthesis exploded'))
    await expect(
      cachedSpeak({ ...base, text: 'retry' }, synthesize),
    ).rejects.toThrow('synthesis exploded')
    // The next call retries instead of awaiting the dead flight.
    const fallback = entry('retried')
    synthesize.mockResolvedValueOnce(fallback)
    await expect(
      cachedSpeak({ ...base, text: 'retry' }, synthesize),
    ).resolves.toBe(fallback)
    expect(synthesize).toHaveBeenCalledTimes(2)
  })
})

describe('cache error propagation', () => {
  it('cacheGet rejects with the injected store error', async () => {
    const key = await speakCacheKey(base)
    failNextIdbOperation('get', new Error('get exploded'))
    await expect(cacheGet(key)).rejects.toThrow('get exploded')
  })

  it('cachePut rejects with the injected store error', async () => {
    const key = await speakCacheKey(base)
    failNextIdbOperation('put', new Error('put exploded'))
    await expect(cachePut(key, entry())).rejects.toThrow('put exploded')
  })
})

describe('cache shape validation', () => {
  it('drops a corrupt entry and re-synthesizes on the next speak', async () => {
    const key = await speakCacheKey(base)
    seedEntry(key, { audio: 'not-a-blob', timeline: [] })

    await expect(cacheGet(key)).resolves.toBeUndefined()
    expect(hasEntry(key)).toBe(false)

    const synthesize = vi.fn(async () => entry('resynthesized'))
    const result = await cachedSpeak(base, synthesize)
    expect(synthesize).toHaveBeenCalledTimes(1)
    expect(await result.audio.text()).toBe('resynthesized')
  })
})

describe('cachedSpeak put failure', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('still resolves and reports the put failure via console.error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const params = { ...base, text: 'put-failure' }
    const synthesize = vi.fn(async () => entry('survived'))
    failNextIdbOperation('put', new Error('put exploded'))

    const result = await cachedSpeak(params, synthesize)
    expect(synthesize).toHaveBeenCalledTimes(1)
    expect(await result.audio.text()).toBe('survived')
    // Let the fire-and-forget put's error events settle.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalledWith(
      'tts cachePut failed',
      expect.any(Error),
    )
  })
})

describe('SpeakEnvelope', () => {
  it('has audio Blob and timeline array', () => {
    expectTypeOf<SpeakEnvelope['audio']>().toEqualTypeOf<Blob>()
    expectTypeOf<SpeakEnvelope['timeline']>().toEqualTypeOf<TimelineEntry[]>()
  })
})
