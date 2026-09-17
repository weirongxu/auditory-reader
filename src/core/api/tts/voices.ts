import { URouter } from '../../route/router.js'
import type { ServerTtsProviderId, ServerVoiceMeta } from '../../tts/types.js'

export type TtsVoicesRes = {
  voices: ServerVoiceMeta[]
}

export const ttsVoicesRouter = new URouter<
  { providerId: ServerTtsProviderId },
  TtsVoicesRes
>('tts/voices')
