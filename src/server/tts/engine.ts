import {
  SERVER_TTS_PROVIDER_IDS,
  type ServerTtsProviderId,
  type ServerVoiceMeta,
  type SpeakParamsInput,
} from '../../core/tts/types.js'
import type { TtsEngine } from './engines/base.js'
import { EdgeEngine } from './engines/edge.js'
import { SherpaEngine } from './engines/sherpa.js'
import type { SpeakAudio } from './types.js'

const MAX_TEXT_LENGTH = 5000

export const engines: Record<ServerTtsProviderId, TtsEngine> = {
  kokoro: new SherpaEngine('kokoro'),
  matcha: new SherpaEngine('matcha'),
  melo: new SherpaEngine('melo'),
  edge: new EdgeEngine(),
}

export function isServerTtsProviderId(
  value: string,
): value is ServerTtsProviderId {
  return (SERVER_TTS_PROVIDER_IDS as readonly string[]).includes(value)
}

export function findEngine(providerId: string): TtsEngine | undefined {
  if (!isServerTtsProviderId(providerId)) return undefined
  return engines[providerId]
}

function validateSpeakParams(params: SpeakParamsInput): {
  engine: TtsEngine
  voice: ServerVoiceMeta
} {
  const engine = findEngine(params.providerId)
  if (!engine) throw new Error(`unknown provider: ${params.providerId}`)
  const voice = engine.findVoice(params.voiceId)
  if (!voice) {
    throw new Error(
      `unknown voice ${params.voiceId} for provider ${params.providerId}`,
    )
  }
  if (!params.text.trim()) throw new Error('text is required')
  if (params.text.length > MAX_TEXT_LENGTH) {
    throw new Error(`text too long, max ${MAX_TEXT_LENGTH} characters`)
  }
  if (!(params.speed > 0)) throw new Error('speed must be positive')
  return { engine, voice }
}

export async function speak(params: SpeakParamsInput): Promise<SpeakAudio> {
  const { engine, voice } = validateSpeakParams(params)
  return engine.speak(voice, { text: params.text, speed: params.speed })
}
