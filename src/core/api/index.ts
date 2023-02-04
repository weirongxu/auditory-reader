import { booksCreateByUrlRouter } from './books/create-by-url.js'
import { booksCreateRouter } from './books/create.js'
import { booksDownloadRouter } from './books/download.js'
import { booksFetchUrlInfoRouter } from './books/fetch-url-info.js'
import { booksMoveTopRouter } from './books/move-top.js'
import { booksPageRouter } from './books/page.js'
import { booksPositionRouter } from './books/position.js'
import { booksRemoveRouter } from './books/remove.js'
import { booksRenderRouter } from './books/render.js'
import { booksShowRouter } from './books/show.js'
import { booksSyncPositionRouter } from './books/sync-position.js'
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
  booksCreateByUrlRouter,
  booksMoveTopRouter,
  booksPageRouter,
  booksPositionRouter,
  booksRemoveRouter,
  booksShowRouter,
  booksDownloadRouter,
  booksSyncPositionRouter,
  booksUpdateRouter,
  booksViewRouter,
  booksRenderRouter,
]
