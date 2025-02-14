import path from '@file-services/path'
import mime from 'mime-types'
import type { BookEpub } from '../book/book-epub.js'
import { bookManager } from '../book/book-manager.js'
import type { BookTypes } from '../book/types.js'
import type { UserInfo } from '../route/session.js'
import { arrayBufferToString } from '../util/converter.js'
import { jsDOMParser } from '../util/dom.js'
import { nextTick } from '../util/promise.js'
import { ReadableExtractor } from '../util/readable.js'
import { Job } from './job.js'

export class UpdatePageParagraphsJob extends Job {
  constructor(
    public userInfo: UserInfo,
    public uuid: string,
    public book: BookEpub,
  ) {
    super()
  }

  async getPageParagraphs() {
    const pageParagraphs: BookTypes.PageParagraph[] = []
    for (const spine of this.book.spines) {
      const filepath = spine.href
      const file = await this.book.file(filepath)
      if (!file) {
        pageParagraphs.push({ paragraphCount: 0 })
        continue
      }
      const content = arrayBufferToString(file.buffer)
      const contType =
        file.mediaType ?? mime.contentType(path.basename(filepath))
      if (
        contType &&
        ['/xml', '/html', '/xhtml'].some((t) => contType.includes(t))
      ) {
        const { doc } = jsDOMParser(content)
        const readableExtractor = new ReadableExtractor(doc, [])
        const parts = readableExtractor.toReadableParts()
        pageParagraphs.push({
          paragraphCount: parts.length,
        })
        await nextTick()
      } else {
        pageParagraphs.push({
          paragraphCount: 0,
        })
      }
    }
    return pageParagraphs
  }

  async start(): Promise<void> {
    void bookManager.update(this.userInfo.account, this.uuid, {
      pageParagraphs: await this.getPageParagraphs(),
    })
  }
}
