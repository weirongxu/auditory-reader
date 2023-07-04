import type { BookEntityBase } from '../entity/book-entity-base'
import { BookEntityIndexedDB } from '../entity/book-entity-indexed-db.js'
import { getDB } from '../indexedDB.js'
import type { BookTypes } from '../types'
import { BookListBase } from './book-list-base.js'

export class BookListIndexedDB extends BookListBase {
  protected async readJson(): Promise<BookTypes.Json> {
    const db = await getDB()
    const storedJson = await db.get('book-json', 'default')
    if (!storedJson) {
      const defaultJson = { list: [] }
      await db.add('book-json', defaultJson, 'default')
      return defaultJson
    }
    return storedJson
  }

  protected async writeJson(json: BookTypes.Json): Promise<void> {
    const db = await getDB()
    await db.put('book-json', json, 'default')
  }

  protected entity2bookEntity(
    entityJson: BookTypes.EntityJson
  ): BookEntityBase {
    return new BookEntityIndexedDB(this.toEntity(entityJson))
  }

  async bookAdd(entity: BookTypes.Entity, file: ArrayBuffer): Promise<void> {
    await BookEntityIndexedDB.create(entity, file)
  }

  async bookDelete(entityJson: BookTypes.EntityJson): Promise<void> {
    const book = new BookEntityIndexedDB(this.toEntity(entityJson))
    await book.delete()
  }
}
