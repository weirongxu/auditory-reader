import { getDB } from '../indexedDB.js'
import type { BookTypes } from '../types'
import { BookEntityBase } from './book-entity-base.js'

export class BookEntityIndexedDB extends BookEntityBase {
  protected propJson?: BookTypes.PropertyJson

  static async create(entity: BookTypes.Entity, file: ArrayBuffer) {
    const bookEntity = new BookEntityIndexedDB(entity)
    await bookEntity.writeFile(file)
    await bookEntity.writeProp()
  }

  constructor(entity: BookTypes.Entity) {
    super(entity)
  }

  async readFileBuffer(): Promise<ArrayBuffer> {
    const db = await getDB()
    const data = await db.get('book-data', this.entity.uuid)
    if (!data) throw new Error(`book(${this.entity.uuid}) data not found`)
    return data.data
  }

  async readFileText(): Promise<string> {
    const buf = await this.readFileBuffer()
    return new TextDecoder('utf-8').decode(buf)
  }

  protected async writeFile(file: ArrayBuffer) {
    const db = await getDB()
    await db.put(
      'book-data',
      {
        data: file,
      },
      this.entity.uuid
    )
  }

  async delete(): Promise<void> {
    const db = await getDB()
    await db.delete('book-data', this.entity.uuid)
  }

  protected async readProp(): Promise<BookTypes.PropertyJson> {
    if (!this.propJson) {
      const db = await getDB()
      this.propJson = (await db.get('book-properties', this.entity.uuid)) ?? {}
    }
    return this.propJson
  }

  protected async writeProp() {
    const json = await this.readProp()
    const db = await getDB()
    await db.put('book-properties', json, this.entity.uuid)
  }

  async posGet(): Promise<BookTypes.PropertyPosition> {
    const json = await this.readProp()
    return (
      json?.position ?? {
        section: 0,
        paragraph: 0,
      }
    )
  }

  async posSet(pos: BookTypes.PropertyPosition): Promise<void> {
    const db = await getDB()
    const json = await this.readProp()
    json.position = pos
    await db.put('book-properties', json, this.entity.uuid)
  }
}
