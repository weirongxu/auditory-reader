import type { SpeakAudio } from './types.js'

export function encodeSpeakEnvelope(audio: SpeakAudio): Buffer {
  const metaJson = Buffer.from(
    JSON.stringify({
      contentType: audio.contentType,
      timeline: audio.timeline,
    }),
    'utf-8',
  )
  const header = Buffer.alloc(4)
  header.writeUInt32BE(metaJson.byteLength, 0)
  return Buffer.concat([header, metaJson, audio.buffer])
}
