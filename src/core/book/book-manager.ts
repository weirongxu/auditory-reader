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
  method: (
    account: string,
    uuid: BookTypes.EntityUUID,
    ...args: any[]
  ) => unknown,
  context: ClassMethodDecoratorContext,
) => {
  const methodName = context.name
  context.addInitializer(function (this: any) {
    this[methodName] = function (
      account: string,
      uuid: BookTypes.EntityUUID,
      ...args: unknown[]
    ) {
      const extractedUuid =
        uuid === TMP_UUID ? bookManager.reqTmpUuid(account) : uuid
      return method.call(this, account, extractedUuid, ...args)
    }
  })
}

class BookManager {
  protected cacheList = new Map<string, BookListBase>()
  protected cacheEntity = new Map<string, BookEntityBase>()
  protected cacheBook = new Map<string, BookBase>()

  reqTmpUuid(account: string) {
    const uuid = this.list(account).tmpUuid
    return uuid ?? TMP_UUID
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
    await this.list(account).delete(uuid)
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
  async update(
    account: string,
    uuid: string,
    update: BookTypes.EntityUpdate,
  ): Promise<void> {
    await this.list(account).update(uuid, update)
    this.cacheEntity.delete(uuid)
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
    switch (bookEntity.entity.type) {
      case 'epub': {
        const epub = await BookEpub.read(await bookEntity.readFileBuffer())
        if (!epub) throw new ErrorRequestResponse('Parse epub error')
        return epub
      }
      case 'text': {
        const text = await BookText.read(
          await bookEntity.readFileText(),
          bookEntity.entity.name,
        )
        return text
      }
      default:
        throw new ErrorRequestResponse(
          `Unsupported type ${bookEntity.entity.type as string}`,
        )
    }
  }
}

export const bookManager = new BookManager()
