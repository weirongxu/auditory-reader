import type { TextAlias } from '../util/readable.js'

export type TtsProviderId = 'webSpeech'

export type TtsProviderNameKey = `tts.provider.${TtsProviderId}.name`
export type TtsProviderDescKey = `tts.provider.${TtsProviderId}.desc`

export interface VoiceMeta {
  providerId: TtsProviderId
  voiceId: string
  name: string
  lang: string
  localService: boolean
}

export interface HighlightEvent {
  charIndex: number
  charLength: number
}

export type SpeakResult = 'cancel' | 'done'

export interface SpeakOptions {
  voice: VoiceMeta
  speed: number
  onBoundary?: (event: HighlightEvent) => void
}

export interface SpeakInput extends SpeakOptions {
  text: string
  isPersonReplace: boolean
  alias?: TextAlias[]
}

export interface TtsProvider {
  readonly id: TtsProviderId
  readonly nameKey: TtsProviderNameKey
  readonly descriptionKey?: TtsProviderDescKey
  getVoices(): VoiceMeta[]
  onVoicesChange(handler: () => void): () => void
  speak(text: string, options: SpeakOptions): Promise<SpeakResult>
  cancel(): void
}
