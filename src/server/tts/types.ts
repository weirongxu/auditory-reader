export type ServerTtsContentType = 'audio/wav' | 'audio/mpeg'

export interface SpeakAudio {
  buffer: Buffer
  contentType: ServerTtsContentType
}
