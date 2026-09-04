import { rainStart, rainStop } from '../../web/pages/books/view/sound.js'
import { findLastIndex, orderBy } from '../util/collection.js'
import type {
  SpeakOptions,
  SpeakResult,
  TtsProvider,
  VoiceMeta,
} from './types.js'

type QuotePosition = { type: 'start' | 'end'; charIndex: number }

function getQuotePositions(text: string): QuotePosition[] {
  const pos: QuotePosition[] = []
  for (const [i, m] of [...text.matchAll(/"|'/g)].entries()) {
    if (i % 2 === 0) {
      pos.push({
        type: 'start',
        charIndex: m.index,
      })
    } else {
      pos.push({
        type: 'end',
        charIndex: m.index,
      })
    }
  }
  for (const m of text.matchAll(/“|‘|「|『/g)) {
    pos.push({
      type: 'start',
      charIndex: m.index,
    })
  }
  for (const m of text.matchAll(/”|’|」|』/g)) {
    pos.push({
      type: 'end',
      charIndex: m.index,
    })
  }
  return orderBy(pos, 'asc', (p) => p.charIndex)
}

export class WebSpeechProvider implements TtsProvider {
  readonly id = 'webSpeech'
  readonly nameKey = 'tts.provider.webSpeech.name'
  readonly descriptionKey = 'tts.provider.webSpeech.desc'

  #utterance: SpeechSynthesisUtterance
  #state: 'speaking' | 'cancel' | 'none' = 'none'

  constructor() {
    this.#utterance = new SpeechSynthesisUtterance()
  }

  getVoices(): VoiceMeta[] {
    return speechSynthesis.getVoices().map((voice) => ({
      providerId: this.id,
      voiceId: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
    }))
  }

  onVoicesChange(handler: () => void): () => void {
    handler()

    if ('addEventListener' in window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', handler)
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler)
      }
    }

    return () => {}
  }

  cancel(): void {
    this.#state = 'cancel'
    if (speechSynthesis.speaking) speechSynthesis.cancel()
  }

  async speak(text: string, options: SpeakOptions): Promise<SpeakResult> {
    this.#state = 'speaking'

    const boundaryListeners: ((event: SpeechSynthesisEvent) => void)[] = []

    const quotePositions = getQuotePositions(text)
    boundaryListeners.push((event: SpeechSynthesisEvent) => {
      const quotePosIndex = findLastIndex(
        quotePositions,
        (p) => p.charIndex <= event.charIndex,
      )
      if (quotePosIndex === undefined) {
        rainStop()
        return
      }
      const posPass = quotePositions.slice(0, quotePosIndex + 1)
      const startPosList = posPass.filter((p) => p.type === 'start')
      const endPosList = posPass.filter((p) => p.type === 'end')
      if (startPosList.length > endPosList.length) {
        rainStart()
      } else {
        rainStop()
      }
    })

    if (options.onBoundary) {
      boundaryListeners.push(options.onBoundary)
    }

    for (const boundaryListener of boundaryListeners) {
      this.#utterance.addEventListener('boundary', boundaryListener)
    }

    this.#utterance.rate = options.speed

    const speechVoice =
      speechSynthesis
        .getVoices()
        .find((v) => v.voiceURI === options.voice.voiceId) ?? null
    this.#utterance.voice = speechVoice
    this.#utterance.text = text
    speechSynthesis.speak(this.#utterance)

    const result = await new Promise<SpeakResult>((resolve, reject) => {
      this.#utterance.addEventListener(
        'end',
        () => {
          resolve(this.#state === 'cancel' ? 'cancel' : 'done')
        },
        { once: true },
      )
      this.#utterance.addEventListener(
        'error',
        (error) => {
          if (this.#state === 'cancel') resolve('cancel')
          else reject(new Error(error.error))
        },
        { once: true },
      )
    })

    for (const boundaryListener of boundaryListeners) {
      this.#utterance.removeEventListener('boundary', boundaryListener)
    }
    rainStop()
    this.#state = 'none'
    return result
  }
}
