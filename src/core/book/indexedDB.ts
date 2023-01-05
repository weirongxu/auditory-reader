import type { DBSchema } from 'idb'
import { openDB } from 'idb'
import type { BookTypes } from './types.js'

interface MyDB extends DBSchema {
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

export async function getDB() {
  return await openDB<MyDB>('auditory-reader', 1, {
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
  })
}
