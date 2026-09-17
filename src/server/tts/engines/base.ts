import type {
  ServerTtsProviderId,
  ServerVoiceMeta,
} from '../../../core/tts/types.js'
import type { SpeakAudio } from '../types.js'

export interface EngineSpeakParams {
  text: string
  speed: number
}

export abstract class TtsEngine {
  abstract readonly providerId: ServerTtsProviderId

  abstract listVoices(): ServerVoiceMeta[]

  findVoice(voiceId: string): ServerVoiceMeta | undefined {
    return this.listVoices().find((v) => v.voiceId === voiceId)
  }

  /** Voice is guaranteed valid & belonging to providerId by engine.ts validation. */
  abstract speak(
    voice: ServerVoiceMeta,
    params: EngineSpeakParams,
  ): Promise<SpeakAudio>
}
