import { ttsSpeakRouter } from '../../../core/api/tts/speak.js'
import { ttsVoicesRouter } from '../../../core/api/tts/voices.js'
import type {
  HighlightEvent,
  ServerTtsProviderId,
  SpeakParamsInput,
  SpeakPlayOptions,
  SpeakResult,
  TimelineEntry,
  VoiceMeta,
} from '../../../core/tts/types.js'
import { cachedSpeak } from '../cache.js'
import { decodeSpeakEnvelope } from '../envelope.js'
import { BaseTtsProvider } from './base.js'

/** Emits onBoundary for timeline entries as audio playback progresses. */
class TimelinePlayer {
  #timeline: TimelineEntry[]
  #onBoundary: (e: HighlightEvent) => void
  #audio: HTMLAudioElement | undefined
  #cursor = 0
  #onTimeUpdate = (): void => {
    const currentTime = this.#audio?.currentTime
    if (currentTime === undefined) return
    // Forward-only: skip entries that already finished before now.
    while (this.#cursor < this.#timeline.length) {
      const entry = this.#timeline[this.#cursor]
      if (!entry || entry.endTime >= currentTime) break
      this.#cursor++
      if (entry.startTime <= currentTime) {
        this.#onBoundary({
          charIndex: entry.charIndex,
          charLength: entry.charLength,
        })
      }
    }
  }

  constructor(
    timeline: TimelineEntry[],
    onBoundary: (e: HighlightEvent) => void,
  ) {
    // Sort defensively: engines may emit unordered entries.
    this.#timeline = [...timeline].sort((a, b) => a.startTime - b.startTime)
    this.#onBoundary = onBoundary
  }

  start(audio: HTMLAudioElement): void {
    this.#audio = audio
    audio.addEventListener('timeupdate', this.#onTimeUpdate)
  }

  stop(): void {
    this.#audio?.removeEventListener('timeupdate', this.#onTimeUpdate)
    this.#audio = undefined
  }
}

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
    { voice, speed, signal, onBoundary }: SpeakPlayOptions,
  ): Promise<SpeakResult> {
    const params: SpeakParamsInput = {
      providerId: this.id,
      voiceId: voice.voiceId,
      text,
      speed,
    }
    try {
      const entry = await cachedSpeak(params, async () => {
        const blob = await ttsSpeakRouter.file(params, signal)
        return decodeSpeakEnvelope(blob)
      })
      if (signal.aborted) return 'cancel'
      const timelinePlayer =
        entry.timeline.length > 0 && onBoundary
          ? new TimelinePlayer(entry.timeline, onBoundary)
          : undefined
      return await this.#audioPlay(entry.audio, signal, timelinePlayer)
    } catch (error) {
      if (signal.aborted) return 'cancel'
      throw error instanceof Error
        ? error
        : new Error('tts speak request failed')
    }
  }

  #audioPlay(
    blob: Blob,
    signal: AbortSignal,
    timelinePlayer: TimelinePlayer | undefined,
  ): Promise<SpeakResult> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      const cleanup = (): void => {
        signal.removeEventListener('abort', onAbort)
        timelinePlayer?.stop()
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
      timelinePlayer?.start(audio)
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
