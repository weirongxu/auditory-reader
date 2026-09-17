import type { TextAlias } from '../util/readable.js'

export const SERVER_TTS_PROVIDER_IDS = [
  'kokoro',
  'matcha',
  'melo',
  'edge',
] as const

export type ServerTtsProviderId = (typeof SERVER_TTS_PROVIDER_IDS)[number]

export type TtsProviderId = 'webSpeech' | ServerTtsProviderId

export type TtsProviderNameKey = `tts.provider.${TtsProviderId}.name`
export type TtsProviderDescKey = `tts.provider.${TtsProviderId}.desc`

interface BaseVoiceMeta<P> {
  providerId: P
  voiceId: string
  name: string
  lang: string
  isServerTts: boolean
}

export type VoiceMeta = BaseVoiceMeta<TtsProviderId>

export type ServerVoiceMeta = BaseVoiceMeta<ServerTtsProviderId>

export interface SpeakParamsInput {
  providerId: string
  voiceId: string
  text: string
  speed: number
}

export interface HighlightEvent {
  charIndex: number
  charLength: number
}

/**
 * 'done' resolves on success. 'cancel' resolves ONLY after `cancel()`, when
 * the session is superseded by a new `speak()` call, or when `signal` aborts
 * (see `SpeakOptions.signal`). Any failure MUST reject (throw), never resolve
 * 'cancel'.
 */
export type SpeakResult = 'cancel' | 'done'

export interface SpeakOptions {
  voice: VoiceMeta
  speed: number
  onBoundary?: (event: HighlightEvent) => void
  signal?: AbortSignal
}

export type SpeakPlayOptions = SpeakOptions & { signal: AbortSignal }

export interface TtsProvider {
  readonly id: TtsProviderId
  readonly nameKey: TtsProviderNameKey
  readonly descriptionKey: TtsProviderDescKey
  getVoices(): Promise<VoiceMeta[]>
  speak(text: string, options: SpeakOptions): Promise<SpeakResult>
  cancel(): void
}

export interface SpeakInput extends SpeakOptions {
  text: string
  isPersonReplace: boolean
  alias?: TextAlias[]
}
