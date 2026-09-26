import type { BookEntityBase } from '../../book/entity/book-entity-base.js'
import { BookListBase } from '../../book/list/book-list-base.js'
import type { BookTypes } from '../../book/types.js'
import { getBookDB } from './db.js'
import { BookEntityIndexedDB } from './entity.js'

export class BookListIndexedDB extends BookListBase {
  protected async readJson(): Promise<BookTypes.Json> {
    const db = await getBookDB()
    const storedJson = await db.get('book-json', 'default')
    if (!storedJson) {
      const defaultJson = this.getDefaultJson()
      await db.put('book-json', defaultJson, 'default')
      return defaultJson
    }
    return storedJson
  }

  protected async writeJson(json: BookTypes.Json): Promise<void> {
    const db = await getBookDB()
    await db.put('book-json', json, 'default')
  }

  protected entity2bookEntity(
    entityJson: BookTypes.EntityJson,
  ): BookEntityBase {
    return new BookEntityIndexedDB(this.toEntity(entityJson))
  }

  protected async bookAdd(
    entity: BookTypes.EntityRaw,
    file: ArrayBuffer,
  ): Promise<void> {
    await BookEntityIndexedDB.create(entity, file)
  }

  protected async bookDelete(entityJson: BookTypes.EntityJson): Promise<void> {
    const book = new BookEntityIndexedDB(this.toEntity(entityJson))
    await book.delete()
  }
}
