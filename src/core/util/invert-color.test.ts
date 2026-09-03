import { expect, it } from 'vitest'

import { invert } from './invert-color.js'

// baseline results captured from invert-color@2.0.0
const cases: Array<[string, string, string]> = [
  ['#fff', '#000000', '#3a3a3a'],
  ['#000', '#ffffff', '#fafafa'],
  ['#ffffff', '#000000', '#3a3a3a'],
  ['#000000', '#ffffff', '#fafafa'],
  ['#ff0000', '#00ffff', '#3a3a3a'],
  ['#3a3a3a', '#c5c5c5', '#fafafa'],
  ['#fafafa', '#050505', '#3a3a3a'],
  ['#123abc', '#edc543', '#fafafa'],
  ['#0f8', '#ff0077', '#3a3a3a'],
  ['0f8', '#ff0077', '#3a3a3a'],
  ['abc123', '#543edc', '#3a3a3a'],
  ['#7f7f7f', '#808080', '#3a3a3a'],
  ['#abc123', '#543edc', '#3a3a3a'],
  ['#00ff88', '#ff0077', '#3a3a3a'],
]

it('invert', () => {
  for (const [color, plain, bw] of cases) {
    expect(invert(color)).toBe(plain)
    expect(invert(color, { black: '#3a3a3a', white: '#fafafa' })).toBe(bw)
  }
  expect(
    invert('#000000', { black: '#111', white: '#eee', threshold: 0 }),
  ).toBe('#eee')
})

it('invert throws on invalid hex', () => {
  expect(() => invert('#12345')).toThrow('Invalid HEX color: "#12345"')
})
