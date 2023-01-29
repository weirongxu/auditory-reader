import { Howl } from 'howler'
import keyboardURL from './sound/keyboard.mp3'
import rainLoopURL from './sound/rain-loop.mp3'
import nextPageURL from './sound/next-page.mp3'
import shutterURL from './sound/shutter.mp3'
import rewindURL from './sound/rewind.mp3'

const shutterSound = new Howl({
  src: [shutterURL],
})
export async function shutterPlay() {
  shutterSound.play()
  await new Promise((resolve) => {
    shutterSound.once('end', resolve)
  })
}

const pressEnterSound = new Howl({
  src: [keyboardURL],
})

export async function pressEnterPlay() {
  pressEnterSound.play()
  await new Promise((resolve) => {
    pressEnterSound.once('end', resolve)
  })
}

const nextPageSound = new Howl({
  src: [nextPageURL],
})

export async function nextPagePlay() {
  nextPageSound.play()
  await new Promise((resolve) => {
    nextPageSound.once('end', resolve)
  })
}

const rainSound = new Howl({
  src: [rainLoopURL],
})
rainSound.loop(true)
rainSound.fade(0, 0.2, 500)

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
  rewindSound.play()
  await new Promise((resolve) => {
    rewindSound.once('end', resolve)
  })
}
