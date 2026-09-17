import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ServerVoiceMeta, SpeakParamsInput } from '../../core/tts/types.js'
import { speak } from './engine.js'

const { edgeSpeak, sherpaSpeak } = vi.hoisted(() => ({
  edgeSpeak: vi.fn(async () => ({ wavData: new Uint8Array() })),
  sherpaSpeak: vi.fn(async () => ({ wavData: new Uint8Array() })),
}))

type MockVoiceSpec = {
  providerId: ServerVoiceMeta['providerId']
  voiceId: string
}

const SHERPA_VOICE_SPECS: MockVoiceSpec[] = [
  { providerId: 'kokoro', voiceId: '0' },
  { providerId: 'kokoro', voiceId: '3' },
  { providerId: 'matcha', voiceId: '0' },
  { providerId: 'melo', voiceId: '0' },
]

vi.mock('./engines/edge.js', () => ({
  EdgeEngine: class {
    readonly providerId = 'edge' as const
    listVoices() {
      return [
        {
          providerId: this.providerId,
          voiceId: 'zh-CN-XiaoxiaoNeural',
          name: '晓晓',
          lang: 'zh-CN',
          isServerTts: true,
        },
      ]
    }
    findVoice(voiceId: string) {
      return this.listVoices().find((v) => v.voiceId === voiceId)
    }
    speak = edgeSpeak
  },
}))
vi.mock('./engines/sherpa.js', () => ({
  SherpaEngine: class {
    constructor(readonly providerId: ServerVoiceMeta['providerId']) {}
    listVoices() {
      return SHERPA_VOICE_SPECS.filter(
        (spec) => spec.providerId === this.providerId,
      ).map((spec) => ({
        ...spec,
        name: '英文女声 Maple',
        lang: 'en-US',
        isServerTts: true,
      }))
    }
    findVoice(voiceId: string) {
      return this.listVoices().find((v) => v.voiceId === voiceId)
    }
    speak = sherpaSpeak
  },
}))

const base: SpeakParamsInput = {
  providerId: 'kokoro',
  voiceId: '0',
  text: 'hello',
  speed: 1,
}

function expectNoneCalled(): void {
  expect(sherpaSpeak).not.toHaveBeenCalled()
  expect(edgeSpeak).not.toHaveBeenCalled()
}

describe('speak', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dispatches sherpa provider with numeric voiceId', async () => {
    await speak(base)
    expect(sherpaSpeak).toHaveBeenCalledTimes(1)
    expect(sherpaSpeak).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ServerVoiceMeta>>({
        providerId: 'kokoro',
        voiceId: '0',
      }),
      { text: 'hello', speed: 1 },
    )
    expect(edgeSpeak).not.toHaveBeenCalled()
  })

  it('routes matcha voiceId to the matcha engine, not kokoro', async () => {
    await speak({ ...base, providerId: 'matcha', voiceId: '0' })
    expect(sherpaSpeak).toHaveBeenCalledTimes(1)
    expect(sherpaSpeak).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ServerVoiceMeta>>({
        providerId: 'matcha',
        voiceId: '0',
      }),
      { text: 'hello', speed: 1 },
    )
    expect(edgeSpeak).not.toHaveBeenCalled()
  })

  it('dispatches edge provider for non-sherpa provider', async () => {
    await speak({
      ...base,
      providerId: 'edge',
      voiceId: 'zh-CN-XiaoxiaoNeural',
    })
    expect(edgeSpeak).toHaveBeenCalledTimes(1)
    expect(edgeSpeak).toHaveBeenCalledWith(
      expect.objectContaining<Partial<ServerVoiceMeta>>({
        providerId: 'edge',
        voiceId: 'zh-CN-XiaoxiaoNeural',
      }),
      { text: 'hello', speed: 1 },
    )
    expect(sherpaSpeak).not.toHaveBeenCalled()
  })

  it('rejects unknown provider', async () => {
    await expect(speak({ ...base, providerId: 'webSpeech' })).rejects.toThrow(
      'unknown provider: webSpeech',
    )
    expectNoneCalled()
  })

  it('rejects unknown voice', async () => {
    await expect(speak({ ...base, voiceId: '999' })).rejects.toThrow(
      'unknown voice',
    )
    expectNoneCalled()
  })

  it('rejects blank text', async () => {
    await expect(speak({ ...base, text: '  ' })).rejects.toThrow(
      'text is required',
    )
    expectNoneCalled()
  })

  it('rejects overlong text', async () => {
    await expect(
      speak({ ...base, text: 'a'.repeat(5000 + 1) }),
    ).rejects.toThrow('text too long')
    expectNoneCalled()
  })

  it('rejects non-positive speed', async () => {
    await expect(speak({ ...base, speed: 0 })).rejects.toThrow(
      'speed must be positive',
    )
    expectNoneCalled()
  })
})
