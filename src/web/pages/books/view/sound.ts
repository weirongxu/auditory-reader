import { Howl } from 'howler'
import soundKeyboard from './sound/keyboard.mp3'
import soundRainLoop from './sound/rain-loop.mp3'

const paragraphEndSound = new Howl({
  src: [soundKeyboard],
})

export async function paragraphEndPlay() {
  paragraphEndSound.play()
  await new Promise((resolve) => {
    paragraphEndSound.once('end', resolve)
  })
}

const rainSound = new Howl({
  src: [soundRainLoop],
})
rainSound.loop(true)
rainSound.fade(0, 0.2, 500)

export function rainStart() {
  if (!rainSound.playing()) {
    rainSound.play()
  }
}

export function rainStop() {
  rainSound.pause()
}
