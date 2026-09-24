import { describe, expect, it } from 'vitest'

import { encodeMp3 } from './mp3.js'

function makeSineSamples(
  frequencyHz: number,
  sampleRate: number,
  durationSec: number,
): Float32Array {
  const sampleCount = Math.round(sampleRate * durationSec)
  const samples = new Float32Array(sampleCount)
  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] =
      Math.sin((2 * Math.PI * frequencyHz * index) / sampleRate) * 0.5
  }
  return samples
}

describe('encodeMp3', () => {
  it('outputs a buffer starting with an mp3 frame sync', async () => {
    const buffer = await encodeMp3(makeSineSamples(440, 24000, 0.5), 24000)
    expect(buffer.length).toBeGreaterThan(0)
    const [byte0, byte1] = buffer
    expect(byte0).toBe(0xff)
    expect(byte1 !== undefined && (byte1 & 0xe0) === 0xe0).toBe(true)
    // Layer III bits (0b01) and non-reserved version bits.
    expect(byte1 !== undefined && ((byte1 >> 1) & 0x03) === 0b01).toBe(true)
    expect(byte1 !== undefined && ((byte1 >> 3) & 0x03) === 0b01).toBe(false)
  })

  it('produces a size in the expected range for the bitrate', async () => {
    const sampleRate = 24000
    const durationSec = 1
    const buffer = await encodeMp3(
      makeSineSamples(440, sampleRate, durationSec),
      sampleRate,
    )
    const expectedBytes = (48_000 / 8) * durationSec
    expect(buffer.length).toBeGreaterThanOrEqual(expectedBytes * 0.5)
    expect(buffer.length).toBeLessThanOrEqual(expectedBytes * 2)
  })

  it('resolves for empty samples', async () => {
    await expect(encodeMp3(new Float32Array([]), 24000)).resolves.toBeDefined()
  })

  it('resolves for very short input', async () => {
    const buffer = await encodeMp3(new Float32Array(100), 24000)
    expect(buffer).toBeInstanceOf(Buffer)
  })
})
