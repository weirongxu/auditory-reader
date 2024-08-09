import { range } from './collection.js'

export function randomRange(start: number, end: number) {
  return Math.random() * (end - start) + start
}

export function randomRangeInt(start: number, end: number) {
  return Math.floor(Math.random() * (end - start + 1)) + start
}

const CHAR_CODES = [
  ...range(0, 26).map((i) => i + 65), // A-Z
  ...range(0, 26).map((i) => i + 97), // a-z
  ...range(0, 10).map((i) => i + 48), // 0-9
  33, // !
  44, // ,
  46, // .
  58, // :
  59, // ;
  63, // ?
  64, // @
  95, // _
]

export function randomChar() {
  const charCodeIndex = randomRangeInt(0, CHAR_CODES.length - 1)
  return String.fromCharCode(CHAR_CODES[charCodeIndex]!)
}

export function randomString(len: number) {
  return range(0, len)
    .map(() => randomChar())
    .join()
}
