import fs from 'fs'
import path from '@file-services/path'
import type { BookTypes } from '../types.js'
import { BookEntityBase } from './book-entity-base.js'

export class BookEntityFS extends BookEntityBase {
  /**
   * Book dir
   * `books/02`
   */
  protected bookDir: string
  /**
   * Book basename
   * `books/02/b9b990-4d72-11ed-86a9-498b78ad0441`
   */
  protected bookBaseNamePath: string
  /**
   * Book data path
   * `books/02/b9b990-4d72-11ed-86a9-498b78ad0441.data`
   */
  protected bufferPath: string
  /**
   * Book prop json path
   * `books/02/b9b990-4d72-11ed-86a9-498b78ad0441.prop.json`
   */
  protected propJsonPath: string
  protected propJson?: BookTypes.PropertyJson

  static async create(
    allBooksDir: string,
    entity: BookTypes.Entity,
    file: ArrayBuffer,
  ) {
    const bookEntity = new BookEntityFS(allBooksDir, entity)
    await bookEntity.mkdir()
    await bookEntity.writeFile(file)
    const prop = await bookEntity.readProp()
    await bookEntity.writeProp(prop)
  }

  constructor(
    protected readonly allBooksDir: string,
    entity: BookTypes.Entity,
  ) {
    super(entity)
    const prefix = entity.uuid.slice(0, 2)
    const remain = entity.uuid.slice(2)
    if (this.entity.isTmp) {
      this.bookDir = path.join(this.allBooksDir, '$')
      this.bookBaseNamePath = path.join(this.bookDir, 'tmp')
    } else {
      this.bookDir = path.join(this.allBooksDir, prefix)
      this.bookBaseNamePath = path.join(this.bookDir, remain)
    }
    this.bufferPath = `${this.bookBaseNamePath}.data`
    this.propJsonPath = `${this.bookBaseNamePath}.prop.json`
  }

  protected async mkdir() {
    await fs.promises.mkdir(this.bookDir, { recursive: true })
  }

  protected async writeFile(file: ArrayBuffer) {
    await fs.promises.writeFile(this.bufferPath, Buffer.from(file))
  }

  async readFileBuffer(): Promise<ArrayBuffer> {
    return fs.promises.readFile(this.bufferPath)
  }

  async readFileText(): Promise<string> {
    return fs.promises.readFile(this.bufferPath, 'utf8')
  }

  async delete() {
    if (fs.existsSync(this.bufferPath)) await fs.promises.rm(this.bufferPath)
    if (fs.existsSync(this.propJsonPath))
      await fs.promises.rm(this.propJsonPath)
    if (fs.existsSync(this.bookDir)) {
      const dirFiles = await fs.promises.readdir(this.bookDir)
      if (dirFiles.length === 0) await fs.promises.rmdir(this.bookDir)
    }
  }

  async readProp(): Promise<BookTypes.PropertyJson> {
    if (!this.propJson) {
      if (!fs.existsSync(this.propJsonPath)) {
        this.propJson = {}
      } else {
        const str = await fs.promises.readFile(this.propJsonPath, 'utf8')
        try {
          this.propJson = JSON.parse(str) as BookTypes.PropertyJson
        } catch {
          this.propJson = {}
        }
      }
    }
    return this.propJson
  }

  async writeProp(prop: BookTypes.PropertyJson) {
    await fs.promises.writeFile(this.propJsonPath, JSON.stringify(prop), 'utf8')
  }
}
