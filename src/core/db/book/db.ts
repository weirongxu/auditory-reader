import type { DBSchema, IDBPDatabase } from 'idb'
import { openDB } from 'idb'

import type { BookTypes } from '../../book/types.js'

interface BookDB extends DBSchema {
  'book-json': {
    key: string
    value: BookTypes.Json
  }

  'book-data': {
    key: string
    value: {
      data: ArrayBuffer
    }
  }

  'book-properties': {
    key: string
    value: BookTypes.PropertyJson
  }
}

let dbPromise: Promise<IDBPDatabase<BookDB>> | undefined

export async function getBookDB() {
  try {
    return await (dbPromise ??= openDB<BookDB>('auditory-reader', 1, {
      upgrade(db) {
        db.createObjectStore('book-json', {
          autoIncrement: false,
        })
        db.createObjectStore('book-data', {
          autoIncrement: false,
        })
        db.createObjectStore('book-properties', {
          autoIncrement: false,
        })
      },
    }))
  } catch (error: unknown) {
    // Avoid poisoning dbPromise with a permanently-rejected promise.
    dbPromise = undefined
    throw error
  }
}
