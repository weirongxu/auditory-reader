import { t } from 'i18next'
import type { BookTypes } from '../../../../core/book/types.js'
import { pushSnackbar } from '../../../common/snackbar.js'
import type { Player } from './player.js'
import { booksAddBookmarksRouter } from '../../../../core/api/books/add-bookmarks.js'
import { booksDeleteBookmarksRouter } from '../../../../core/api/books/delete-bookmarks.js'
import { booksUpdateBookmarksRouter } from '../../../../core/api/books/update-bookmarks.js'
import { uiConfirm } from '../../../common/confirm.js'

export class PlayerBookmarks {
  /** book uuid */
  uuid: string
  reload?: () => void

  constructor(public readonly player: Player) {
    this.uuid = player.book.item.uuid
  }

  async addBookmark(
    pos: BookTypes.PropertyPosition,
  ): Promise<undefined | BookTypes.PropertyBookmark> {
    const node = this.player.iframeCtrler.readableParts.at(pos.paragraph)
    if (!node) return
    if (node.type !== 'text') {
      pushSnackbar({
        severity: 'error',
        message: t('desc.noSuportedBookmark'),
      })
      return
    }
    const brief = node.text.slice(0, 30)
    const res = await booksAddBookmarksRouter.action({
      bookmarks: [
        {
          brief,
          type: 'text',
          section: pos.section,
          paragraph: pos.paragraph,
        },
      ],
      uuid: this.uuid,
    })
    this.reload?.()
    pushSnackbar({
      message: `${t('desc.addedBookmark')} ${brief}`,
    })
    return res.bookmarks.at(0)
  }

  async updateBookmark(bookmark: BookTypes.PropertyBookmark) {
    await booksUpdateBookmarksRouter.action({
      uuid: this.uuid,
      bookmarks: [bookmark],
    })
    this.reload?.()
    return pushSnackbar({
      message: `${t('desc.updatedBookmark')} ${bookmark.brief}`,
    })
  }

  async removeBookmark(bookmark: BookTypes.PropertyBookmark) {
    if (bookmark.note) {
      await uiConfirm({
        title: t('prompt.bookmarkRemoveConfirm'),
        description: (
          <>
            <p>{bookmark.brief}</p>
            <p>Note: {bookmark.note}</p>
          </>
        ),
      })
    }

    await booksDeleteBookmarksRouter.action({
      uuid: this.uuid,
      bookmarkUuids: [bookmark.uuid],
    })
    this.reload?.()
    return pushSnackbar({
      message: `${t('desc.deletedBookmark')} ${bookmark.brief}`,
    })
  }

  posBookmark(pos: BookTypes.PropertyPosition) {
    const bookmarks = this.player.states.bookmarks
    if (!bookmarks) return
    const bookmark = bookmarks.find(
      (b) => b.section === pos.section && b.paragraph === pos.paragraph,
    )
    if (!bookmark) return
    return bookmark
  }

  async toggleBookmark(pos: BookTypes.PropertyPosition) {
    const bookmark = this.posBookmark(pos)
    if (bookmark) {
      await this.removeBookmark(bookmark)
    } else {
      await this.addBookmark(pos)
    }
  }
}
