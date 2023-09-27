import { TMP_UUID } from '../consts.js'
import { env } from '../env.js'
import { ErrorRequestResponse } from '../route/session.js'
import type { BookBase } from './book-base'
import { BookEpub } from './book-epub.js'
import { BookText } from './book-text.js'
import type { BookEntityBase } from './entity/book-entity-base'
import type { BookListBase } from './list/book-list-base'
import { BookListFS } from './list/book-list-fs.js'
import { BookListIndexedDB } from './list/book-list-indexed-db.js'
import type { BookTypes } from './types.js'

const extractUuid = (
  method: (account: string, uuid: BookTypes.EntityUUID) => unknown,
  context: ClassMethodDecoratorContext,
) => {
  const methodName = context.name
  context.addInitializer(function (this: any) {
    this[methodName] = function (account: string, uuid: BookTypes.EntityUUID) {
      const extractedUuid =
        uuid === TMP_UUID ? bookManager.reqTmpUuid(account) : uuid
      return method.call(this, account, extractedUuid)
    }
  })
}

class BookManager {
  protected cacheList = new Map<string, BookListBase>()
  protected cacheEntity = new Map<string, BookEntityBase>()
  protected cacheBook = new Map<string, BookBase>()

  reqTmpUuid(account: string) {
    const uuid = this.list(account).tmpUuid
    if (!uuid) throw new ErrorRequestResponse(`uuid(${uuid}) not found`)
    return uuid
  }

  list(account: string) {
    let bookList = this.cacheList.get(account)
    if (!bookList) {
      bookList =
        env.appMode === 'server'
          ? new BookListFS(account)
          : new BookListIndexedDB(account)
      this.cacheList.set(account, bookList)
    }
    return bookList
  }

  @extractUuid
  async delete(account: string, uuid: BookTypes.EntityUUID) {
    this.cacheEntity.delete(uuid)
    this.cacheBook.delete(uuid)
    await bookManager.list(account).delete(uuid)
  }

  @extractUuid
  async entity(account: string, uuid: string): Promise<BookEntityBase> {
    let entity = this.cacheEntity.get(uuid)
    if (!entity) {
      entity = await this.list(account).book(uuid)
      if (!entity)
        throw new ErrorRequestResponse(`book entity(${uuid}) not found`)
      this.cacheEntity.set(uuid, entity)
    }
    return entity
  }

  @extractUuid
  async book(account: string, uuid: string): Promise<BookBase> {
    let book = this.cacheBook.get(uuid)
    if (!book) {
      const bookEntity = await this.entity(account, uuid)
      book = await this.parseBook(bookEntity)
      this.cacheBook.set(uuid, book)
    }
    return book
  }

  protected async parseBook(bookEntity: BookEntityBase): Promise<BookBase> {
    if (bookEntity.entity.type === 'epub') {
      const epub = await BookEpub.read(await bookEntity.readFileBuffer())
      if (!epub) throw new ErrorRequestResponse('Parse epub error')
      return epub
    } else if (bookEntity.entity.type === 'text') {
      const text = await BookText.read(
        await bookEntity.readFileText(),
        bookEntity.entity.name,
      )
      if (!text) throw new ErrorRequestResponse('Parse text error')
      return text
    } else {
      throw new ErrorRequestResponse(
        `Unsupported type ${bookEntity.entity.type as string}`,
      )
    }
  }
}

export const bookManager = new BookManager()
