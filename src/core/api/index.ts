import type { URouter } from '../route/router.js'
import { booksAnnotationsRouter } from './books/annotations.js'
import { booksAnnotationsDeleteRouter } from './books/annotations-delete.js'
import { booksAnnotationsUpsertRouter } from './books/annotations-upsert.js'
import { booksCoverRouter } from './books/cover.js'
import { booksCreateRouter } from './books/create.js'
import { booksCreateByHtmlRouter } from './books/create-by-html.js'
import { booksCreateByUrlRouter } from './books/create-by-url.js'
import { booksDownloadRouter } from './books/download.js'
import { booksExportListRouter } from './books/export-list.js'
import { booksFetchUrlInfoRouter } from './books/fetch-url-info.js'
import { booksImportRouter } from './books/import.js'
import { booksKeywordsRouter } from './books/keywords.js'
import { booksKeywordsDeleteRouter } from './books/keywords-delete.js'
import { booksKeywordsUpsertRouter } from './books/keywords-upsert.js'
import { booksMoveAfterRouter } from './books/move-after.js'
import { booksMoveTopRouter } from './books/move-top.js'
import { booksPageRouter } from './books/page.js'
import { booksPageParagraphsRouter } from './books/page-paragraphs.js'
import { booksPositionRouter } from './books/position.js'
import { booksPositionSyncRouter } from './books/position-sync.js'
import { booksPropertyRouter } from './books/property.js'
import { booksRemoveRouter } from './books/remove.js'
import { booksRenderRouter } from './books/render.js'
import { booksSearchRouter } from './books/search.js'
import { booksShowRouter } from './books/show.js'
import { booksTmpStoreRouter } from './books/tmp-store.js'
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
  booksCreateByHtmlRouter,
  booksMoveAfterRouter,
  booksMoveTopRouter,
  booksPageRouter,
  booksExportListRouter,
  booksRemoveRouter,
  booksShowRouter,
  booksDownloadRouter,
  booksImportRouter,
  booksPositionRouter,
  booksPositionSyncRouter,
  booksPropertyRouter,
  booksAnnotationsRouter,
  booksAnnotationsUpsertRouter,
  booksAnnotationsDeleteRouter,
  booksKeywordsRouter,
  booksKeywordsUpsertRouter,
  booksKeywordsDeleteRouter,
  booksUpdateRouter,
  booksViewRouter,
  booksPageParagraphsRouter,
  booksCoverRouter,
  booksRenderRouter,
  booksSearchRouter,
] satisfies URouter[]
