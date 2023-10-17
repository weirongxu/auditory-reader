import { Speech, type SpeakResult } from '../../../../core/util/speech.js'
import { Highlight } from './highlight.js'
import type { Player } from './player'
import type { PlayerIframeController } from './player-iframe-controller.js'
import type { PlayerStatesManager } from './player-states'
import {
  nextPagePlay,
  pressEnterPlay,
  rewindPlay,
  shutterPlay,
} from './sound.js'
import type { ReadablePartText } from './types.js'

const speakRetriedMax = 3

export class Utterer {
  hl: Highlight
  states: PlayerStatesManager
  speech: Speech

  constructor(
    public player: Player,
    states: PlayerStatesManager,
    iframeCtrler: PlayerIframeController,
  ) {
    this.states = states
    this.hl = new Highlight(iframeCtrler, states)

    this.speech = new Speech()

    this.states.uiEvents.on('voice', (voice) => {
      this.speech.voice = voice
    })
    this.states.uiEvents.on('speechSpeed', (speechSpeed) => {
      this.speech.rate = speechSpeed
    })
  }

  cancel() {
    this.speech.cancel()
  }

  async speakNode(node: ReadablePartText): Promise<SpeakResult> {
    return this.speech.speak(node.text, {
      isPersonReplace: this.states.isPersonReplace,
      alias: this.player.iframeCtrler.alias,
      onBoundary: (event) => {
        this.hl.highlight(node, event.charIndex, event.charLength)
      },
    })
  }

  async speakText(text: string): Promise<SpeakResult> {
    return this.speech.speak(text, {
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
        await nextPagePlay()
      }
      // stop
      else {
        this.player.pause()
      }
    } else {
      // next paragraph
      await this.player.nextParagraph()
      await pressEnterPlay()
    }
  }

  async startLoop() {
    let retriedCount = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.states.started) return
      try {
        const node = this.player.iframeCtrler.readableParts.at(
          this.states.pos.paragraph,
        )
        if (node) {
          if (node.type === 'text') {
            let isCancel = false
            for (let i = 0; i < this.states.paragraphRepeat; i++) {
              const ret = await this.speakNode(node)
              if (ret === 'cancel') {
                isCancel = true
                break
              } else if (i !== this.states.paragraphRepeat - 1) {
                await rewindPlay()
              }
            }
            // May pause, jumps to other paragraphs, leave page.
            // Continue is necessary, when the user jumps to other paragraphs
            if (isCancel) continue
          } else if (node.type === 'image') {
            await shutterPlay()
          }
        }

        await this.nextPart()
      } catch (err) {
        console.error(err)
        retriedCount += 1
        if (retriedCount > speakRetriedMax) {
          await this.nextPart()
          retriedCount = 0
        }
      }
    }
  }
}
