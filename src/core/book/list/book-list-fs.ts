import fs from 'fs'
import path from 'path'
import { env } from '../../env.js'
import { BookEntityFS } from '../entity/book-entity-fs.js'
import type { BookTypes } from '../types'
import { BookListBase } from './book-list-base.js'
import type { BookEntityBase } from '../entity/book-entity-base.js'

export class BookListFS extends BookListBase {
  /**
   * `path/to/:account`
   */
  protected accountDir: string
  /**
   * `path/to/:account/books.json`
   */
  protected jsonPath: string
  /**
   * `path/to/:account/books`
   */
  protected allBooksDir: string

  constructor(account: string) {
    super(account)
    this.accountDir = path.join(env.dataPath, 'users', account)
    this.allBooksDir = path.join(this.accountDir, 'books')
    this.jsonPath = path.join(this.accountDir, 'books.json')
  }

  protected async readJson(): Promise<BookTypes.Json> {
    const jsonPath = this.jsonPath
    if (!fs.existsSync(jsonPath)) {
      return { list: [] }
    } else {
      const str = await fs.promises.readFile(jsonPath, 'utf8')
      return JSON.parse(str) as BookTypes.Json
    }
  }

  protected async writeJson(json: BookTypes.Json) {
    if (!fs.existsSync(this.accountDir))
      await fs.promises.mkdir(this.accountDir, { recursive: true })
    await fs.promises.writeFile(this.jsonPath, JSON.stringify(json), 'utf8')
  }

  protected entity2bookEntity(
    entityJson: BookTypes.EntityJson
  ): BookEntityBase {
    return new BookEntityFS(this.allBooksDir, this.toEntity(entityJson))
  }

  async bookAdd(entity: BookTypes.Entity, file: ArrayBuffer): Promise<void> {
    await BookEntityFS.create(this.allBooksDir, entity, file)
  }

  async bookDelete(entityJson: BookTypes.EntityJson): Promise<void> {
    const book = new BookEntityFS(this.allBooksDir, this.toEntity(entityJson))
    await book.delete()
  }
}
