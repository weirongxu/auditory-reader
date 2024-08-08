import type { URouter } from '../route/router.js'
import { booksAnnotationsRouter } from './books/annotations.js'
import { booksLocationInPageRouter } from './books/book-location.js'
import { booksCoverRouter } from './books/cover.js'
import { booksCreateByUrlRouter } from './books/create-by-url.js'
import { booksCreateRouter } from './books/create.js'
import { booksDeleteAnnotationsRouter } from './books/delete-annotations.js'
import { booksDownloadRouter } from './books/download.js'
import { booksFetchUrlInfoRouter } from './books/fetch-url-info.js'
import { booksMoveAfterRouter } from './books/move-after.js'
import { booksMoveTopRouter } from './books/move-top.js'
import { booksPageRouter } from './books/page.js'
import { booksPositionRouter } from './books/position.js'
import { booksRemoveRouter } from './books/remove.js'
import { booksRenderRouter } from './books/render.js'
import { booksSearchRouter } from './books/search.js'
import { booksShowRouter } from './books/show.js'
import { booksSyncPositionRouter } from './books/sync-position.js'
import { booksTmpStoreRouter } from './books/tmp-store.js'
import { booksUpdateRouter } from './books/update.js'
import { booksUpsertAnnotationsRouter } from './books/upsert-annotations.js'
import { booksViewRouter } from './books/view.js'
import { loginRouter } from './login.js'
import { logoutRouter } from './logout.js'
import { userRouter } from './user.js'

export const ROUTERS = [
  loginRouter,
  logoutRouter,
  userRouter,
  booksCreateRouter,
  booksFetchUrlInfoRouter,
  booksTmpStoreRouter,
  booksCreateByUrlRouter,
  booksMoveAfterRouter,
  booksMoveTopRouter,
  booksPageRouter,
  booksLocationInPageRouter,
  booksRemoveRouter,
  booksShowRouter,
  booksDownloadRouter,
  booksPositionRouter,
  booksSyncPositionRouter,
  booksAnnotationsRouter,
  booksUpsertAnnotationsRouter,
  booksDeleteAnnotationsRouter,
  booksUpdateRouter,
  booksViewRouter,
  booksCoverRouter,
  booksRenderRouter,
  booksSearchRouter,
] satisfies URouter[]
