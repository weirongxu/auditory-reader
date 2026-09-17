import { URouter } from '../../route/router.js'
import type { SpeakParamsInput } from '../../tts/types.js'

export const ttsSpeakRouter = new URouter<SpeakParamsInput, Buffer>('tts/speak')
