import { describe, expect, it } from 'vitest'

import { engines, findEngine } from './engine.js'

const getEngine = (providerId: string) => {
  const engine = findEngine(providerId)
  if (!engine) throw new Error(`engine ${providerId} not found`)
  return engine
}

describe('listVoices', () => {
  it('returns only voices of the engine provider', () => {
    for (const engine of Object.values(engines)) {
      for (const voice of engine.listVoices()) {
        expect(voice.providerId).toBe(engine.providerId)
        expect(voice.isServerTts).toBe(true)
        expect(voice.lang).toBeTruthy()
      }
    }
  })

  it('returns only the matcha voice', () => {
    const matcha = getEngine('matcha')
    const voices = matcha.listVoices()
    expect(voices).toHaveLength(1)
    expect(voices[0]?.name).toBe('中文女声 Baker')
  })

  it('returns edge voices served by the server', () => {
    const edge = getEngine('edge')
    const voices = edge.listVoices()
    expect(voices.length).toBeGreaterThan(0)
    for (const voice of voices) {
      expect(voice.isServerTts).toBe(true)
      expect(voice.lang).toMatch(/^(zh-(CN|HK|TW)|en-US|ja-JP|ko-KR)$/)
    }
    for (const voiceId of [
      'en-US-AriaNeural',
      'ja-JP-NanamiNeural',
      'ko-KR-SunHiNeural',
    ]) {
      expect(voices.some((v) => v.voiceId === voiceId)).toBe(true)
    }
  })

  it('has unique voiceIds per engine', () => {
    for (const engine of Object.values(engines)) {
      const ids = engine.listVoices().map((v) => v.voiceId)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('findVoice', () => {
  it('finds a kokoro voice by sid', () => {
    const kokoro = getEngine('kokoro')
    expect(kokoro.findVoice('3')?.name).toContain('中文女声')
  })

  it('matcha voiceId 0 hits Baker, not kokoro Maple', () => {
    const matcha = getEngine('matcha')
    expect(matcha.findVoice('0')?.name).toBe('中文女声 Baker')
  })

  it('kokoro voiceId 0 hits Maple', () => {
    const kokoro = getEngine('kokoro')
    expect(kokoro.findVoice('0')?.name).toBe('英文女声 Maple')
  })

  it('returns undefined for unknown voice', () => {
    const edge = getEngine('edge')
    expect(edge.findVoice('no-such-voice')).toBeUndefined()
  })
})
