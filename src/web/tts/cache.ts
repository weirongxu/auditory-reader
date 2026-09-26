import { Mutex } from 'async-mutex'

import { getTtsCacheDB, TTS_CACHE_STORE_NAME } from '../../core/db/tts-cache.js'
import type { SpeakEnvelope, SpeakParamsInput } from '../../core/tts/types.js'

function joinParams(params: SpeakParamsInput): string {
  return [
    params.providerId,
    params.voiceId,
    String(params.speed),
    params.text,
  ].join('|')
}

export async function speakCacheKey(params: SpeakParamsInput): Promise<string> {
  const raw = joinParams(params)
  // Non-secure contexts and some test envs lack crypto.subtle; raw key is still deterministic.
  if (globalThis.crypto?.subtle === undefined) return raw
  const digest = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(raw),
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function cacheGet(
  key: string,
): Promise<SpeakEnvelope | undefined> {
  const db = await getTtsCacheDB()
  const entry = await db.get(TTS_CACHE_STORE_NAME, key)
  // An app upgrade may have changed the stored layout.
  if (
    entry !== undefined &&
    (!(entry.audio instanceof Blob) || !Array.isArray(entry.timeline))
  ) {
    // Deletion failure must not break the cache-miss path.
    void db.delete(TTS_CACHE_STORE_NAME, key).catch((error: unknown) => {
      console.error('failed to delete invalid tts cache entry', { key, error })
    })
    return undefined
  }
  return entry
}

export async function cachePut(
  key: string,
  entry: SpeakEnvelope,
): Promise<void> {
  const db = await getTtsCacheDB()
  await db.put(TTS_CACHE_STORE_NAME, entry, key)
}

// Sole caller (providers/server.ts) is single-flight; one global lock suffices.
const mutex = new Mutex()

export async function cachedSpeak(
  params: SpeakParamsInput,
  synthesize: () => Promise<SpeakEnvelope>,
): Promise<SpeakEnvelope> {
  const key = await speakCacheKey(params)
  const cached = await cacheGet(key)
  if (cached) return cached
  return mutex.runExclusive(async () => {
    const cachedNow = await cacheGet(key)
    if (cachedNow) return cachedNow
    const entry = await synthesize()
    try {
      // Awaited in-lock so queued callers observe the entry; failure is swallowed below.
      await cachePut(key, entry)
    } catch (error: unknown) {
      console.error('tts cachePut failed', error)
    }
    return entry
  })
}
