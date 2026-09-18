import type { TimelineEntry } from '../../core/tts/types.js'

export type ServerTtsContentType = 'audio/wav' | 'audio/mpeg'

export interface SpeakAudio {
  buffer: Buffer
  contentType: ServerTtsContentType
  timeline: TimelineEntry[]
}
