import { z } from 'zod'

import type { SpeakEnvelope } from '../../core/tts/types.js'

const timelineEntrySchema = z.object({
  charIndex: z.number(),
  charLength: z.number(),
  startTime: z.number(),
  endTime: z.number(),
})

const metaSchema = z.object({
  contentType: z.string().min(1),
  timeline: z.array(timelineEntrySchema),
})

// Format: [u32be metaJsonByteLength][meta JSON (UTF-8)][audio bytes],
// where meta JSON is { contentType, timeline }.
export async function decodeSpeakEnvelope(blob: Blob): Promise<SpeakEnvelope> {
  try {
    const buffer = await blob.arrayBuffer()
    // Internal messages only document the failure; the outer catch replaces
    // them with the single uniform envelope error.
    if (buffer.byteLength < 4) throw new Error('meta too short')
    const view = new DataView(buffer)
    const metaEnd = 4 + view.getUint32(0)
    if (metaEnd > buffer.byteLength) throw new Error('meta out of bounds')
    const { contentType, timeline } = metaSchema.parse(
      JSON.parse(new TextDecoder('utf-8').decode(buffer.slice(4, metaEnd))),
    )
    return {
      audio: new Blob([buffer.slice(metaEnd)], { type: contentType }),
      timeline,
    }
  } catch (error) {
    throw new Error('tts speak envelope invalid', { cause: error })
  }
}
