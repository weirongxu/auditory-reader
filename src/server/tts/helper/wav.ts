const BITS_PER_SAMPLE = 16
const CHANNELS = 1

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

export function encodeWav(samples: Float32Array, sampleRate: number): Buffer {
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, CHANNELS, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * CHANNELS * (BITS_PER_SAMPLE / 8), true)
  view.setUint16(32, CHANNELS * (BITS_PER_SAMPLE / 8), true)
  view.setUint16(34, BITS_PER_SAMPLE, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  for (const [index, sample] of samples.entries()) {
    const clamped = Math.max(-1, Math.min(1, sample))
    view.setInt16(
      44 + index * 2,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true,
    )
  }

  return buffer
}
