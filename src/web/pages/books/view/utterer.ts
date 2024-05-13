import { Speech, type SpeakResult } from '../../../../core/util/speech.js'
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
import { UttererHighlight } from './utterer-highlight.js'

const speakRetriedMax = 3

export class Utterer {
  hl: UttererHighlight
  states: PlayerStatesManager
  speech: Speech

  constructor(
    public player: Player,
    states: PlayerStatesManager,
    iframeCtrler: PlayerIframeController,
  ) {
    this.states = states
    this.hl = new UttererHighlight(iframeCtrler, states)

    this.speech = new Speech()
  }

  cancel() {
    this.speech.cancel()
  }

  async speakNode(node: ReadablePartText): Promise<SpeakResult> {
    if (!this.states.voice) return 'done'

    return this.speech.speak(node.text, {
      voice: this.states.voice,
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
    })
  }

  async speakText(text: string): Promise<SpeakResult> {
    if (!this.states.voice) return 'done'

    return this.speech.speak(text, {
      voice: this.states.voice,
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
      if (!this.states.started) return
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
        retriedCount += 1
        if (retriedCount > speakRetriedMax) {
          await this.nextPart()
          retriedCount = 0
        }
      }
    }
  }
}
