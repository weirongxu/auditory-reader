import mime from 'mime-types'
import { ErrorRequestResponse } from '../../route/session.js'
import type { BookTypes } from '../types.js'
import { orderBy } from '../../util/collection.js'

export abstract class BookEntityBase {
  constructor(public readonly entity: BookTypes.Entity) {}

  abstract readFileBuffer(): Promise<ArrayBuffer>

  abstract readFileText(): Promise<string>

  async download(): Promise<{
    contentType: string
    buffer: ArrayBuffer
    filename: string
  }> {
    const buffer = await this.readFileBuffer()
    let extname: string | undefined
    let contentType: string | false = false
    if (this.entity.type === 'epub') {
      extname = '.epub'
    } else if (this.entity.type === 'text') {
      extname = '.txt'
    }
    const unknownHint = 'Book type unknown'
    if (!extname) throw new ErrorRequestResponse(unknownHint)
    contentType = mime.contentType(extname)
    if (!contentType) throw new ErrorRequestResponse(unknownHint)
    const filename = this.entity.name + extname
    return { contentType, buffer, filename }
  }

  async reset() {
    await this.posSet({
      section: 0,
      paragraph: 0,
    })
    await this.bookmarksDeleteAll()
  }

  abstract delete(): Promise<void>

  protected abstract readProp(): Promise<BookTypes.PropertyJson>

  protected abstract writeProp(prop: BookTypes.PropertyJson): Promise<void>

  async posGet(): Promise<BookTypes.PropertyPosition> {
    const prop = await this.readProp()
    return (
      prop.position ?? {
        section: 0,
        paragraph: 0,
      }
    )
  }

  async posSet(pos: BookTypes.PropertyPosition): Promise<void> {
    const prop = await this.readProp()
    prop.position = pos
    await this.writeProp(prop)
  }

  async bookmarksGet(): Promise<BookTypes.PropertyBookmark[]> {
    const prop = await this.readProp()
    return prop.bookmarks ?? []
  }

  private sortBookmarks(bookmarks: BookTypes.PropertyBookmark[]) {
    return orderBy(bookmarks, 'asc', (b) => [b.section, b.paragraph])
  }

  async bookmarksAdd(bookmarks: BookTypes.PropertyBookmark[]) {
    const prop = await this.readProp()
    prop.bookmarks ??= []
    for (const bookmark of bookmarks) {
      prop.bookmarks.push(bookmark)
    }
    prop.bookmarks = this.sortBookmarks(prop.bookmarks)
    await this.writeProp(prop)
  }

  async bookmarksUpdate(bookmarks: BookTypes.PropertyBookmark[]) {
    const prop = await this.readProp()
    if (!prop.bookmarks) return
    for (const bookmark of bookmarks) {
      const index = prop.bookmarks.findIndex((b) => b.uuid === bookmark.uuid)
      if (index !== -1) prop.bookmarks[index] = bookmark
    }
    await this.writeProp(prop)
  }

  async bookmarksDelete(bookmarkUuids: string[]) {
    const prop = await this.readProp()
    if (prop.bookmarks) {
      prop.bookmarks = prop.bookmarks.filter(
        (b) => !bookmarkUuids.includes(b.uuid),
      )
      prop.bookmarks = this.sortBookmarks(prop.bookmarks)
    }
    await this.writeProp(prop)
  }

  async bookmarksDeleteAll() {
    const prop = await this.readProp()
    if (prop.bookmarks) prop.bookmarks = []
    await this.writeProp(prop)
  }
}
