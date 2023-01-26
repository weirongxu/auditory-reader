import type { BookCreateByUrl } from '../core/api/books/create-by-url.js'
import { booksCreateByUrlRouter } from '../core/api/books/create-by-url.js'
import type { BookCreate } from '../core/api/books/create.js'
import { booksCreateRouter } from '../core/api/books/create.js'
import type { BookFetchUrlInfoQuery } from '../core/api/books/fetch-url-info.js'
import { booksFetchUrlInfoRouter } from '../core/api/books/fetch-url-info.js'
import type { BookTopItQuery } from '../core/api/books/move-top.js'
import { booksMoveTopRouter } from '../core/api/books/move-top.js'
import type { BookUpdateQuery } from '../core/api/books/update.js'
import { booksUpdateRouter } from '../core/api/books/update.js'
import type { BookTypes } from '../core/book/types.js'

export const API = {
  book: {
    async add(params: BookCreate): Promise<BookTypes.EntityJson> {
      return await booksCreateRouter.action(params)
    },
    async fetchUrlInfo(params: BookFetchUrlInfoQuery) {
      return await booksFetchUrlInfoRouter.action(params)
    },
    async addByUrl(params: BookCreateByUrl): Promise<BookTypes.EntityJson> {
      return await booksCreateByUrlRouter.action(params)
    },
    async update(params: BookUpdateQuery): Promise<void> {
      await booksUpdateRouter.action(params)
    },
    async top(params: BookTopItQuery): Promise<void> {
      await booksMoveTopRouter.action(params)
    },
  },
}

window.API = API
