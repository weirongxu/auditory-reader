import { booksAddBookmarksRouter } from './books/add-bookmarks.js'
import { booksBookmarksRouter } from './books/bookmarks.js'
import { booksCoverRouter } from './books/cover.js'
import { booksCreateByUrlRouter } from './books/create-by-url.js'
import { booksCreateRouter } from './books/create.js'
import { booksDeleteBookmarksRouter } from './books/delete-bookmarks.js'
import { booksDownloadRouter } from './books/download.js'
import { booksFetchUrlInfoRouter } from './books/fetch-url-info.js'
import { booksMoveOffsetRouter } from './books/move-offset.js'
import { booksMoveTopRouter } from './books/move-top.js'
import { booksPageRouter } from './books/page.js'
import { booksPositionRouter } from './books/position.js'
import { booksRemoveRouter } from './books/remove.js'
import { booksRenderRouter } from './books/render.js'
import { booksShowRouter } from './books/show.js'
import { booksSyncPositionRouter } from './books/sync-position.js'
import { booksTmpStoreRouter } from './books/tmp-store.js'
import { booksUpdateBookmarksRouter } from './books/update-bookmarks.js'
import { booksUpdateRouter } from './books/update.js'
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
  booksMoveOffsetRouter,
  booksMoveTopRouter,
  booksPageRouter,
  booksRemoveRouter,
  booksShowRouter,
  booksDownloadRouter,
  booksPositionRouter,
  booksSyncPositionRouter,
  booksBookmarksRouter,
  booksAddBookmarksRouter,
  booksUpdateBookmarksRouter,
  booksDeleteBookmarksRouter,
  booksUpdateRouter,
  booksViewRouter,
  booksCoverRouter,
  booksRenderRouter,
]
