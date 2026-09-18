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
import { BaseTtsProvider } from './base.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isTimelineEntry(entry: unknown): entry is TimelineEntry {
  return (
    isRecord(entry) &&
    Number.isFinite(entry.charIndex) &&
    Number.isFinite(entry.charLength) &&
    Number.isFinite(entry.startTime) &&
    Number.isFinite(entry.endTime)
  )
}

interface SpeakEnvelope {
  audio: Blob
  timeline: TimelineEntry[]
}

// Format: [u32be metaJsonByteLength][meta JSON (UTF-8)][audio bytes],
// where meta JSON is { contentType, timeline }.
async function decodeSpeakEnvelope(blob: Blob): Promise<SpeakEnvelope> {
  try {
    const buffer = await blob.arrayBuffer()
    // Internal messages only document the failure; the outer catch replaces
    // them with the single uniform envelope error.
    if (buffer.byteLength < 4) throw new Error('meta too short')
    const view = new DataView(buffer)
    const metaEnd = 4 + view.getUint32(0)
    if (metaEnd > buffer.byteLength) throw new Error('meta out of bounds')
    const meta: unknown = JSON.parse(
      new TextDecoder('utf-8').decode(buffer.slice(4, metaEnd)),
    )
    // isRecord excludes null/array, so non-record meta degrades to an empty
    // object and fails the content validation below.
    const { contentType, timeline } = isRecord(meta) ? meta : {}
    if (
      typeof contentType !== 'string' ||
      contentType.length === 0 ||
      !Array.isArray(timeline) ||
      !timeline.every(isTimelineEntry)
    ) {
      throw new Error('invalid meta')
    }
    return {
      audio: new Blob([buffer.slice(metaEnd)], { type: contentType }),
      timeline,
    }
  } catch (error) {
    throw new Error('tts speak envelope invalid', { cause: error })
  }
}

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
      const blob = await ttsSpeakRouter.file(params, signal)
      if (signal.aborted) return 'cancel'
      const { audio, timeline } = await decodeSpeakEnvelope(blob)
      if (signal.aborted) return 'cancel'
      const timelinePlayer =
        timeline.length > 0 && onBoundary
          ? new TimelinePlayer(timeline, onBoundary)
          : undefined
      return await this.#audioPlay(audio, signal, timelinePlayer)
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
