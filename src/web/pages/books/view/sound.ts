import { Howl } from 'howler'
import keyboardURL from './sound/keyboard.mp3'
import rainLoopURL from './sound/rain-loop.mp3'
import nextPageURL from './sound/next-page.mp3'
import shutterURL from './sound/shutter.mp3'
import rewindURL from './sound/rewind.mp3'

async function playHowlSound(howl: Howl): Promise<void> {
  howl.play()
  await new Promise<void>((resolve) => {
    howl.once('end', () => resolve())
  })
}

const shutterSound = new Howl({
  src: [shutterURL],
})
export async function shutterPlay() {
  await playHowlSound(shutterSound)
}

const pressEnterSound = new Howl({
  src: [keyboardURL],
})

export async function pressEnterPlay() {
  await playHowlSound(pressEnterSound)
}

const nextPageSound = new Howl({
  src: [nextPageURL],
})

export async function nextPagePlay() {
  await playHowlSound(nextPageSound)
}

const rainSound = new Howl({
  src: [rainLoopURL],
})
rainSound.loop(true)
rainSound.fade(0, 0.5, 500)

export function rainStart() {
  if (!rainSound.playing()) {
    rainSound.play()
  }
}

export function rainStop() {
  if (rainSound.playing()) {
    rainSound.pause()
  }
}

const rewindSound = new Howl({
  src: [rewindURL],
  volume: 0.5,
})

export async function rewindPlay() {
  await playHowlSound(rewindSound)
}
