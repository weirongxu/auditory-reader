import { ttsSpeakRouter } from '../../../core/api/tts/speak.js'
import { ttsVoicesRouter } from '../../../core/api/tts/voices.js'
import type {
  ServerTtsProviderId,
  SpeakParamsInput,
  SpeakPlayOptions,
  SpeakResult,
  VoiceMeta,
} from '../../../core/tts/types.js'
import { BaseTtsProvider } from './base.js'

export class ServerTtsProvider extends BaseTtsProvider {
  #voicesPromise: Promise<VoiceMeta[]> | undefined

  constructor(override readonly id: ServerTtsProviderId) {
    super(id)
  }

  async getVoices(): Promise<VoiceMeta[]> {
    this.#voicesPromise ??= (async () => {
      try {
        const data = await ttsVoicesRouter.json({ providerId: this.id })
        return data.voices
      } catch (error) {
        // NOTE: keep retryable — clear the single-flight promise so the
        // next getVoices() call loads again
        this.#voicesPromise = undefined
        console.error(`tts voices load failed for ${this.id}`, error)
        return []
      }
    })()
    return this.#voicesPromise
  }

  protected async play(
    text: string,
    { voice, speed, signal }: SpeakPlayOptions,
  ): Promise<SpeakResult> {
    const params: SpeakParamsInput = {
      providerId: this.id,
      voiceId: voice.voiceId,
      text,
      speed,
    }
    try {
      const blob = await ttsSpeakRouter.file(params, signal)
      if (signal.aborted) return 'cancel'
      return await this.#audioPlay(blob, signal)
    } catch (error) {
      if (signal.aborted) return 'cancel'
      throw error instanceof Error
        ? error
        : new Error('tts speak request failed')
    }
  }

  #audioPlay(blob: Blob, signal: AbortSignal): Promise<SpeakResult> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      const cleanup = (): void => {
        signal.removeEventListener('abort', onAbort)
        audio.pause()
        URL.revokeObjectURL(url)
      }
      const onAbort = (): void => {
        cleanup()
        resolve('cancel')
      }
      const fail = (): void => {
        cleanup()
        // NOTE: abort during failure still resolves 'cancel'
        if (signal.aborted) resolve('cancel')
        else reject(new Error('tts audio playback failed'))
      }

      signal.addEventListener('abort', onAbort, { once: true })
      audio.addEventListener(
        'ended',
        () => {
          cleanup()
          resolve('done')
        },
        { once: true },
      )
      audio.addEventListener('error', fail, { once: true })
      audio.play().catch(fail)
    })
  }
}
