import { describe, expect, it } from 'vitest'

import { encodeWav } from './wav.js'

describe('encodeWav', () => {
  it('writes a valid 16-bit mono wav header', () => {
    const buffer = encodeWav(new Float32Array([0, 0.5, -0.5]), 22050)
    expect(buffer.length).toBe(44 + 6)
    expect(buffer.toString('ascii', 0, 4)).toBe('RIFF')
    expect(buffer.toString('ascii', 8, 12)).toBe('WAVE')
    expect(buffer.readUint32LE(24)).toBe(22050)
    expect(buffer.readUint16LE(22)).toBe(1)
    expect(buffer.readUint32LE(40)).toBe(6)
  })

  it('converts float samples to clamped 16-bit pcm', () => {
    const buffer = encodeWav(new Float32Array([1, -1, 2, -2]), 16000)
    expect(buffer.readInt16LE(44 + 0 * 2)).toBe(32767)
    expect(buffer.readInt16LE(44 + 1 * 2)).toBe(-32768)
    expect(buffer.readInt16LE(44 + 2 * 2)).toBe(32767)
    expect(buffer.readInt16LE(44 + 3 * 2)).toBe(-32768)
  })
})
