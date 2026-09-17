import type {
  SpeakOptions,
  SpeakPlayOptions,
  SpeakResult,
  TtsProvider,
  TtsProviderDescKey,
  TtsProviderId,
  TtsProviderNameKey,
  VoiceMeta,
} from '../../../core/tts/types.js'

export abstract class BaseTtsProvider implements TtsProvider {
  readonly nameKey: TtsProviderNameKey
  readonly descriptionKey: TtsProviderDescKey

  constructor(readonly id: TtsProviderId) {
    this.nameKey = `tts.provider.${this.id}.name`
    this.descriptionKey = `tts.provider.${this.id}.desc`
  }

  abstract getVoices(): Promise<VoiceMeta[]>

  #session: AbortController | undefined

  /**
   * Resolves 'done' on success. Resolves 'cancel' for a user-initiated
   * `cancel()`, when superseded by a new `speak()` call, or when
   * `options.signal` aborts. Throws on any failure.
   */
  async speak(text: string, options: SpeakOptions): Promise<SpeakResult> {
    this.#session?.abort()
    if (options.signal?.aborted) return 'cancel'

    const session = new AbortController()
    this.#session = session
    const signal = options.signal
      ? AbortSignal.any([options.signal, session.signal])
      : session.signal
    return this.play(text, { ...options, signal })
  }

  cancel(): void {
    this.#session?.abort()
  }

  /**
   * Provider-specific playback. Receives a guaranteed `signal` that aborts on
   * `cancel()`, on supersede by a newer `speak()`, or when the caller-supplied
   * signal aborts. Must resolve 'cancel' itself (never throw) on abort, and
   * must remove its own signal listeners once settled.
   */
  protected abstract play(
    text: string,
    options: SpeakPlayOptions,
  ): Promise<SpeakResult>
}
