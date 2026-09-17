export type { AliasResult } from '../../core/tts/alias.js'
export { aliasReplace } from '../../core/tts/alias.js'
export type {
  HighlightEvent,
  SpeakInput,
  SpeakOptions,
  SpeakResult,
  TtsProvider,
  TtsProviderDescKey,
  TtsProviderId,
  TtsProviderNameKey,
  VoiceMeta,
} from '../../core/tts/types.js'
export { registry } from './registry.js'
export { speak } from './speak.js'

import { env } from '../../core/env.js'
import { SERVER_TTS_PROVIDER_IDS } from '../../core/tts/types.js'
import { ServerTtsProvider } from './providers/server.js'
import { WebSpeechProvider } from './providers/web-speech.js'
import { registry } from './registry.js'

registry.register(new WebSpeechProvider())
if (env.appMode === 'server') {
  for (const id of SERVER_TTS_PROVIDER_IDS) {
    registry.register(new ServerTtsProvider(id))
  }
}
