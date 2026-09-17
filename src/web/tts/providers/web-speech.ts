import type {
  SpeakPlayOptions,
  SpeakResult,
  VoiceMeta,
} from '../../../core/tts/types.js'
import { BaseTtsProvider } from './base.js'

export class WebSpeechProvider extends BaseTtsProvider {
  constructor() {
    super('webSpeech')
  }

  async getVoices(): Promise<VoiceMeta[]> {
    const map = (): VoiceMeta[] =>
      speechSynthesis.getVoices().map((voice) => ({
        providerId: this.id,
        voiceId: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        isServerTts: false,
      }))

    const voices = map()
    if (voices.length > 0) return voices

    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 1000)
      const onVoicesChanged = (): void => {
        clearTimeout(timer)
        resolve()
      }
      speechSynthesis.addEventListener('voiceschanged', onVoicesChanged, {
        once: true,
      })
    })
    return map()
  }

  protected async play(
    text: string,
    { voice, speed, onBoundary, signal }: SpeakPlayOptions,
  ): Promise<SpeakResult> {
    const utterance = new SpeechSynthesisUtterance()
    const boundaryListener = onBoundary
      ? (event: SpeechSynthesisEvent) =>
          onBoundary({
            charIndex: event.charIndex,
            charLength: event.charLength ?? 0,
          })
      : undefined

    utterance.rate = speed
    const speechVoice =
      speechSynthesis.getVoices().find((v) => v.voiceURI === voice.voiceId) ??
      null
    utterance.voice = speechVoice
    utterance.text = text

    try {
      return await this.#startPlayback(utterance, signal, boundaryListener)
    } finally {
      if (boundaryListener) {
        utterance.removeEventListener('boundary', boundaryListener)
      }
    }
  }

  #startPlayback(
    utterance: SpeechSynthesisUtterance,
    signal: AbortSignal,
    boundaryListener: ((event: SpeechSynthesisEvent) => void) | undefined,
  ): Promise<SpeakResult> {
    return new Promise<SpeakResult>((resolve, reject) => {
      const cleanup = (): void => {
        signal.removeEventListener('abort', onAbort)
      }
      const onAbort = (): void => {
        cleanup()
        resolve('cancel')
        if (speechSynthesis.speaking) speechSynthesis.cancel()
      }
      const onEnd = (): void => {
        cleanup()
        resolve('done')
      }
      const onError = (event: SpeechSynthesisErrorEvent): void => {
        cleanup()
        reject(new Error(event.error))
      }
      utterance.addEventListener('end', onEnd, { once: true })
      utterance.addEventListener('error', onError, { once: true })
      if (boundaryListener) {
        utterance.addEventListener('boundary', boundaryListener)
      }
      signal.addEventListener('abort', onAbort, { once: true })
      speechSynthesis.speak(utterance)
    })
  }
}
