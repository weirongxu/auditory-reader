import { ZH_PERSON_RULES } from '../../core/consts.js'
import { aliasReplace } from '../../core/tts/alias.js'
import type {
  HighlightEvent,
  SpeakInput,
  SpeakResult,
  TtsProvider,
} from '../../core/tts/types.js'
import { findLast } from '../../core/util/collection.js'

function replacePersonText(text: string): string {
  for (const [key, value] of Object.entries(ZH_PERSON_RULES)) {
    text = text.replaceAll(key, value.word)
  }
  return text
}

function remapBoundary(
  onBoundary: (event: HighlightEvent) => void,
  highlightOffsetTable: [index: number, accOffset: number][],
): (event: HighlightEvent) => void {
  return (event) => {
    const startOffset = findLast(
      highlightOffsetTable,
      ([i]) => i <= event.charIndex,
    )
    if (!startOffset) {
      onBoundary(event)
      return
    }
    const charEndIndex = event.charIndex + event.charLength
    const endOffset = findLast(highlightOffsetTable, ([i]) => i <= charEndIndex)
    if (!endOffset) {
      onBoundary(event)
      return
    }
    const charIndex = event.charIndex + startOffset[1]
    const charLength = charEndIndex + endOffset[1] - charIndex
    onBoundary({ charIndex, charLength })
  }
}

const ATTEMPTS = 3

export async function speak(
  provider: TtsProvider,
  input: SpeakInput,
): Promise<SpeakResult> {
  let text = input.isPersonReplace ? replacePersonText(input.text) : input.text
  let { onBoundary } = input

  if (input.alias?.length) {
    const aliasResult = aliasReplace(text, input.alias)
    text = aliasResult.text
    if (onBoundary && aliasResult.highlightOffsets.length) {
      onBoundary = remapBoundary(onBoundary, aliasResult.highlightOffsets)
    }
  }

  let lastError: unknown
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (input.signal?.aborted) return 'cancel'
    try {
      const result = await provider.speak(text, {
        voice: input.voice,
        speed: input.speed,
        signal: input.signal,
        onBoundary,
      })
      return result
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}
