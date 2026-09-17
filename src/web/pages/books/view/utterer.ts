import { Mutex } from 'async-mutex'
import { t } from 'i18next'

import type { ReadablePartText } from '../../../../core/util/readable.js'
import { notificationApi } from '../../../common/notification.js'
import type {
  SpeakInput,
  SpeakResult,
  TtsProvider,
  VoiceMeta,
} from '../../../tts/index.js'
import { registry, speak } from '../../../tts/index.js'
import { UttererHighlight } from './highlight/utterer-highlight.js'
import type { Player } from './player.js'
import type { PlayerIframeController } from './player-iframe-controller.js'
import type { PlayerStatesManager } from './player-states.js'
import { rainStart, rainStop, rewindPlay, shutterPlay } from './sound.js'
import { createQuoteRainListener } from './utterer-quote.js'

const suspendMutex = new Mutex()

export class UttererSuspendStored {
  constructor(
    public started: boolean,
    public mutexRelease: () => void,
  ) {}
}

export class Utterer {
  hl: UttererHighlight
  states: PlayerStatesManager
  // TODO 看能否重构并且去掉 #loopGeneration
  #loopGeneration = 0

  constructor(
    public player: Player,
    states: PlayerStatesManager,
    iframeCtrler: PlayerIframeController,
  ) {
    this.states = states
    this.hl = new UttererHighlight(iframeCtrler, states)
  }

  get #activeProvider(): TtsProvider | undefined {
    return registry.get(this.states.ttsProviderId)
  }

  cancel() {
    this.#activeProvider?.cancel()
  }

  async suspend() {
    const mutexRelease = await suspendMutex.acquire()
    const stored = new UttererSuspendStored(this.states.started, mutexRelease)
    this.states.started = false
    this.#activeProvider?.cancel()
    return stored
  }

  resume(stored: UttererSuspendStored) {
    this.states.started = stored.started
    stored.mutexRelease()
    this.startLoop()
  }

  #speakGuard(): { provider: TtsProvider; voice: VoiceMeta } {
    const provider = this.#activeProvider
    if (!provider) throw new Error('tts provider not found')
    const voice = this.states.voice
    if (!voice) throw new Error('tts voice not selected')
    return { provider, voice }
  }

  async #speakWithQuote(
    provider: TtsProvider,
    options: SpeakInput,
  ): Promise<SpeakResult> {
    const quoteRainListener = createQuoteRainListener(options.text, {
      start: rainStart,
      stop: rainStop,
    })
    return speak(provider, {
      ...options,
      onBoundary: (event) => {
        quoteRainListener(event)
        options.onBoundary?.(event)
      },
    }).finally(rainStop)
  }

  async speakNode(node: ReadablePartText): Promise<SpeakResult> {
    const { provider, voice } = this.#speakGuard()

    return this.#speakWithQuote(provider, {
      voice,
      speed: this.states.speechSpeed,
      isPersonReplace: this.states.isPersonReplace,
      alias: this.player.iframeCtrler.alias,
      onBoundary: (event) => {
        this.hl.highlight(
          [
            {
              node,
              charIndex: event.charIndex,
              charLength: event.charLength,
            },
          ],
          true,
        )
      },
      text: node.text,
    })
  }

  async speakText(text: string): Promise<SpeakResult> {
    const { provider, voice } = this.#speakGuard()

    return this.#speakWithQuote(provider, {
      text,
      voice,
      speed: this.states.speechSpeed,
      isPersonReplace: this.states.isPersonReplace,
      alias: this.player.iframeCtrler.alias,
    })
  }

  private async nextPart() {
    // end of section
    if (
      this.states.pos.paragraph >=
      this.player.iframeCtrler.readableParts.length - 1
    ) {
      // next section
      if (
        this.states.pos.section < this.player.book.spines.length - 1 &&
        this.states.autoNextSection
      ) {
        await this.player.nextSection()
        // await nextPagePlay()
      }
      // stop
      else {
        this.player.pause()
      }
    } else {
      // next paragraph
      await this.player.nextParagraph()
      // await pressEnterPlay()
    }
  }

  startLoop() {
    this.#loopGeneration += 1
    void this.#startLoop(this.#loopGeneration)
  }

  async #startLoop(generation: number) {
    // TODO #startLoop 得想办法重构
    const isStale = () =>
      !this.states.started || generation !== this.#loopGeneration
    while (true) {
      if (isStale()) return
      try {
        const node = this.player.iframeCtrler.readableParts.at(
          this.states.pos.paragraph,
        )
        if (node) {
          switch (node.type) {
            case 'text': {
              let isCancel = false
              for (let i = 0; i < this.states.paragraphRepeat; i++) {
                const ret = await this.speakNode(node)
                if (ret === 'cancel') {
                  if (isStale()) return
                  isCancel = true
                  break
                } else if (i !== this.states.paragraphRepeat - 1) {
                  await rewindPlay()
                }
              }
              // May pause, jumps to other paragraphs, leave page.
              // Continue is necessary, when the user jumps to other paragraphs
              if (isCancel) continue
              break
            }
            case 'image': {
              await shutterPlay()
              break
            }
          }
        }

        await this.nextPart()
      } catch (err) {
        console.error(err)
        if (isStale()) return
        notificationApi().error({
          message: t('error.speak'),
          description: err instanceof Error ? err.message : err?.toString(),
        })
        this.player.pause()
        return
      }
    }
  }
}
