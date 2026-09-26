import type { DBSchema, IDBPDatabase } from 'idb'
import { openDB } from 'idb'

import type { SpeakEnvelope } from './envelope.js'

const TTS_CACHE_DB_NAME = 'tts-cache'

export const TTS_CACHE_STORE_NAME = 'speak'

interface TtsCacheDB extends DBSchema {
  speak: {
    // Out-of-line keys: the key is the speak params hash, the value is
    // the whole SpeakEnvelope (structured clone stores Blobs cheaply).
    key: string
    value: SpeakEnvelope
  }
}

let dbPromise: Promise<IDBPDatabase<TtsCacheDB>> | undefined

export async function getDB(): Promise<IDBPDatabase<TtsCacheDB>> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('indexeddb is not available')
  }
  try {
    return await (dbPromise ??= openDB<TtsCacheDB>(TTS_CACHE_DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(TTS_CACHE_STORE_NAME)
      },
    }))
  } catch (error: unknown) {
    // Avoid poisoning dbPromise with a permanently-rejected promise.
    dbPromise = undefined
    throw error
  }
}
