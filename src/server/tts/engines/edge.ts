import type { Readable } from 'node:stream'

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

import type { ServerVoiceMeta } from '../../../core/tts/types.js'
import type { SpeakAudio } from '../types.js'
import { type EngineSpeakParams, TtsEngine } from './base.js'

function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

type EdgeVoiceSpec = {
  voiceId: string
  name: string
  lang: string
}

const EDGE_VOICE_SPECS: EdgeVoiceSpec[] = [
  { voiceId: 'zh-CN-XiaoxiaoNeural', name: '晓晓', lang: 'zh-CN' },
  { voiceId: 'zh-CN-XiaoyiNeural', name: '晓伊', lang: 'zh-CN' },
  { voiceId: 'zh-CN-YunxiNeural', name: '云希', lang: 'zh-CN' },
  { voiceId: 'zh-CN-YunyangNeural', name: '云扬', lang: 'zh-CN' },
  { voiceId: 'zh-HK-HiuMaanNeural', name: '曉曼', lang: 'zh-HK' },
  { voiceId: 'zh-TW-HsiaoChenNeural', name: '曉臻', lang: 'zh-TW' },
  { voiceId: 'en-US-AriaNeural', name: '英文女声 Aria', lang: 'en-US' },
  { voiceId: 'en-US-JennyNeural', name: '英文女声 Jenny', lang: 'en-US' },
  { voiceId: 'en-US-GuyNeural', name: '英文男声 Guy', lang: 'en-US' },
  {
    voiceId: 'en-US-ChristopherNeural',
    name: '英文男声 Christopher',
    lang: 'en-US',
  },
  { voiceId: 'ja-JP-NanamiNeural', name: '日文女声 Nanami', lang: 'ja-JP' },
  { voiceId: 'ja-JP-KeitaNeural', name: '日文男声 Keita', lang: 'ja-JP' },
  { voiceId: 'ko-KR-SunHiNeural', name: '韩语女声 SunHi', lang: 'ko-KR' },
  { voiceId: 'ko-KR-InJoonNeural', name: '韩语男声 InJoon', lang: 'ko-KR' },
]

export class EdgeEngine extends TtsEngine {
  readonly providerId = 'edge' as const

  listVoices(): ServerVoiceMeta[] {
    return EDGE_VOICE_SPECS.map((spec) => ({
      providerId: this.providerId,
      voiceId: spec.voiceId,
      name: spec.name,
      lang: spec.lang,
      isServerTts: true,
    }))
  }

  async speak(
    voice: ServerVoiceMeta,
    { text, speed }: EngineSpeakParams,
  ): Promise<SpeakAudio> {
    const tts = new MsEdgeTTS()
    try {
      await tts.setMetadata(
        voice.voiceId,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
        { wordBoundaryEnabled: false },
      )
      const { audioStream } = tts.toStream(escapeXml(text), { rate: speed })
      return {
        buffer: await streamToBuffer(audioStream),
        contentType: 'audio/mpeg',
      }
    } finally {
      tts.close()
    }
  }
}
