import { ttsSpeakRouter } from '../../core/api/tts/speak.js'
import type { TtsVoicesRes } from '../../core/api/tts/voices.js'
import { ttsVoicesRouter } from '../../core/api/tts/voices.js'
import { ErrorRequestResponse } from '../../core/route/session.js'
import { findEngine, speak } from './engine.js'
import { encodeSpeakEnvelope } from './envelope.js'

ttsVoicesRouter.routeLogined(async ({ req }): Promise<TtsVoicesRes> => {
  const { providerId } = await req.body
  const engine = findEngine(providerId)
  if (!engine) {
    throw new ErrorRequestResponse('unknown provider')
  }
  return { voices: engine.listVoices() }
})

ttsSpeakRouter.routeLogined(async ({ req, res }) => {
  const body = await req.body
  try {
    const audio = await speak(body)
    // Envelope payload: the response body is not raw audio, so advertise a
    // generic type; the real audio type travels inside the envelope meta.
    res.header('Content-Type', 'application/octet-stream')
    return encodeSpeakEnvelope(audio)
  } catch (error) {
    if (error instanceof Error) throw new ErrorRequestResponse(error.message)
    throw error
  }
})
