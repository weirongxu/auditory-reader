import { getDB } from '../indexedDB.js'
import type { BookTypes } from '../types'
import { BookEntityBase } from './book-entity-base.js'

export class BookEntityIndexedDB extends BookEntityBase {
  protected propJson?: BookTypes.PropertyJson
  protected uid: string

  static async create(entity: BookTypes.Entity, file: ArrayBuffer) {
    const bookEntity = new BookEntityIndexedDB(entity)
    await bookEntity.writeFile(file)
    const prop = await bookEntity.readProp()
    await bookEntity.writeProp(prop)
  }

  constructor(entity: BookTypes.Entity) {
    super(entity)
    if (this.entity.isTmp) {
      this.uid = '$tmp'
    } else {
      this.uid = entity.uuid
    }
  }

  async readFileBuffer(): Promise<ArrayBuffer> {
    const db = await getDB()
    const data = await db.get('book-data', this.uid)
    if (!data) throw new Error(`book(${this.uid}) data not found`)
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
      this.uid,
    )
  }

  async delete(): Promise<void> {
    const db = await getDB()
    await db.delete('book-data', this.uid)
  }

  protected async readProp(): Promise<BookTypes.PropertyJson> {
    if (!this.propJson) {
      const db = await getDB()
      this.propJson = (await db.get('book-properties', this.uid)) ?? {}
    }
    return this.propJson
  }

  protected async writeProp(prop: BookTypes.PropertyJson) {
    const db = await getDB()
    await db.put('book-properties', prop, this.uid)
  }
}
