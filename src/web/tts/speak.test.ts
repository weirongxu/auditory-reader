import { describe, expect, it, vi } from 'vitest'

import type {
  SpeakInput,
  SpeakResult,
  TtsProvider,
  VoiceMeta,
} from '../../core/tts/types.js'
import { speak } from './speak.js'

const voice: VoiceMeta = {
  providerId: 'webSpeech',
  voiceId: 'v1',
  name: 'voice',
  lang: 'zh',
  isServerTts: false,
}

const input: SpeakInput = {
  text: 'hello',
  voice,
  speed: 1,
  isPersonReplace: false,
}

const inputWithSignal = (signal?: AbortSignal): SpeakInput => ({
  ...input,
  signal,
})

function mockProvider(results: Array<() => Promise<SpeakResult>>) {
  const speakFn = vi.fn((): Promise<SpeakResult> => {
    const next = results.shift()
    if (!next) throw new Error('unexpected extra speak call')
    return next()
  })

  const provider: TtsProvider = {
    id: 'webSpeech',
    nameKey: 'tts.provider.webSpeech.name',
    descriptionKey: 'tts.provider.webSpeech.desc',
    getVoices: () => Promise.resolve([voice]),
    speak: () => speakFn(),
    cancel: () => {},
  }

  return { provider, speak: speakFn }
}

describe('speak retry', () => {
  it('retries after throws and returns done', async () => {
    const { provider, speak: providerSpeak } = mockProvider([
      () => Promise.reject(new Error('a')),
      () => Promise.reject(new Error('b')),
      () => Promise.resolve('done'),
    ])
    await expect(speak(provider, input)).resolves.toBe('done')
    expect(providerSpeak).toHaveBeenCalledTimes(3)
  })

  it('rethrows the original error after retries are exhausted', async () => {
    const error = new Error('always fails')
    const { provider, speak: providerSpeak } = mockProvider([
      () => Promise.reject(error),
      () => Promise.reject(error),
      () => Promise.reject(error),
    ])
    await expect(speak(provider, input)).rejects.toBe(error)
    expect(providerSpeak).toHaveBeenCalledTimes(3)
  })

  it('returns cancel immediately without retrying', async () => {
    const { provider, speak: providerSpeak } = mockProvider([
      () => Promise.resolve('cancel'),
      () => Promise.resolve('done'),
    ])
    await expect(speak(provider, input)).resolves.toBe('cancel')
    expect(providerSpeak).toHaveBeenCalledTimes(1)
  })

  it('returns cancel without calling the provider when the signal is already aborted', async () => {
    const { provider, speak: providerSpeak } = mockProvider([
      () => Promise.resolve('done'),
    ])
    const controller = new AbortController()
    controller.abort()
    await expect(
      speak(provider, inputWithSignal(controller.signal)),
    ).resolves.toBe('cancel')
    expect(providerSpeak).not.toHaveBeenCalled()
  })

  it('returns cancel and does not retry when the provider rejects after abort', async () => {
    const controller = new AbortController()
    const { provider, speak: providerSpeak } = mockProvider([
      () => {
        controller.abort()
        return Promise.reject(new Error('aborted'))
      },
    ])
    await expect(
      speak(provider, inputWithSignal(controller.signal)),
    ).resolves.toBe('cancel')
    expect(providerSpeak).toHaveBeenCalledTimes(1)
  })
})
