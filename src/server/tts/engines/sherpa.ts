import type { OfflineTtsInstance } from 'sherpa-onnx-node'
import sherpa from 'sherpa-onnx-node'

import type { ServerVoiceMeta } from '../../../core/tts/types.js'
import { encodeWav } from '../helper/wav.js'
import type { SpeakAudio } from '../types.js'
import { type EngineSpeakParams, TtsEngine } from './base.js'
import {
  buildSherpaModelConfig,
  sherpaModelFilesExist,
  type SherpaProviderId,
} from './sherpa-models.js'

const instances = new Map<SherpaProviderId, Promise<OfflineTtsInstance>>()

function getInstance(
  providerId: SherpaProviderId,
): Promise<OfflineTtsInstance> {
  const cached = instances.get(providerId)
  if (cached) return cached

  const created = sherpa.OfflineTts.createAsync(
    buildSherpaModelConfig(providerId),
  )
  created.catch(() => {
    if (instances.get(providerId) === created) instances.delete(providerId)
  })
  instances.set(providerId, created)
  return created
}

type SherpaVoiceSpec = {
  providerId: SherpaProviderId
  voiceId: string
  name: string
  lang: string
}

const SHERPA_VOICE_SPECS: SherpaVoiceSpec[] = [
  { providerId: 'kokoro', voiceId: '0', name: '英文女声 Maple', lang: 'en-US' },
  { providerId: 'kokoro', voiceId: '1', name: '英文女声 Sol', lang: 'en-US' },
  { providerId: 'kokoro', voiceId: '3', name: '中文女声 1', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '4', name: '中文女声 2', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '6', name: '中文女声 3', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '11', name: '中文女声 4', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '25', name: '中文女声 5', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '34', name: '中文女声 6', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '58', name: '中文男声 1', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '60', name: '中文男声 2', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '66', name: '中文男声 3', lang: 'zh-CN' },
  { providerId: 'kokoro', voiceId: '76', name: '中文男声 4', lang: 'zh-CN' },
  { providerId: 'matcha', voiceId: '0', name: '中文女声 Baker', lang: 'zh-CN' },
  { providerId: 'melo', voiceId: '0', name: '中英混合声', lang: 'zh-CN' },
]

export class SherpaEngine extends TtsEngine {
  constructor(readonly providerId: SherpaProviderId) {
    super()
  }

  listVoices(): ServerVoiceMeta[] {
    return SHERPA_VOICE_SPECS.filter(
      (spec) => spec.providerId === this.providerId,
    ).map((spec) => ({ ...spec, isServerTts: true }))
  }

  async speak(
    voice: ServerVoiceMeta,
    { text, speed }: EngineSpeakParams,
  ): Promise<SpeakAudio> {
    const { providerId } = this
    if (!sherpaModelFilesExist(providerId)) {
      throw new Error(
        `tts model not found, run scripts/download-tts-models.sh ${providerId}`,
      )
    }

    const tts = await getInstance(providerId)
    const audio = await tts.generateAsync({
      text,
      sid: Number(voice.voiceId),
      speed,
    })
    return {
      buffer: encodeWav(audio.samples, audio.sampleRate),
      contentType: 'audio/wav',
      timeline: [],
    }
  }
}
