import { Mutex } from 'async-mutex'
import { createMp3Encoder } from 'wasm-media-encoders'

const BITRATE_KBPS = 48

// Shared encoder instance; created lazily and cleared on failure to allow retry.
let encoderPromise: Promise<
  Awaited<ReturnType<typeof createMp3Encoder>>
> | null = null

// The encoder is stateful, so configure/encode/finalize must never interleave.
const mutex = new Mutex()

function getEncoder() {
  if (!encoderPromise) {
    const created = createMp3Encoder()
    created.catch(() => {
      if (encoderPromise === created) encoderPromise = null
    })
    encoderPromise = created
  }
  return encoderPromise
}

export async function encodeMp3(
  samples: Float32Array,
  sampleRate: number,
): Promise<Buffer> {
  return mutex.runExclusive(async () => {
    const encoder = await getEncoder()
    encoder.configure({
      channels: 1,
      sampleRate,
      bitrate: BITRATE_KBPS,
    })
    const chunks: Buffer[] = []
    if (samples.length > 0) {
      // Copy immediately: the returned Uint8Array is a live view into wasm
      // memory that finalize() overwrites.
      chunks.push(Buffer.from(encoder.encode([samples])))
    }
    chunks.push(Buffer.from(encoder.finalize()))
    return Buffer.concat(chunks)
  })
}
