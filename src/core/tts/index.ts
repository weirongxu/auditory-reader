export type { AliasResult } from './alias.js'
export { aliasReplace } from './alias.js'
export { registry } from './registry.js'
export { speak } from './speak.js'
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
} from './types.js'

import { registry } from './registry.js'
import { WebSpeechProvider } from './web-speech-provider.js'

registry.register(new WebSpeechProvider())
