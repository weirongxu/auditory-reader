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
    switch (this.entity.type) {
      case 'epub':
        extname = '.epub'
        break
      case 'text':
        extname = '.txt'
        break
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
    await this.annotationsDeleteAll()
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

  private sortBookmarks(bookmarks: BookTypes.PropertyBookmark[]) {
    return orderBy(bookmarks, 'asc', (b) => [b.section, b.paragraph])
  }

  async bookmarksGet(): Promise<BookTypes.PropertyBookmark[]> {
    const prop = await this.readProp()
    return prop.bookmarks ?? []
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

  private sortAnnotations(annotations: BookTypes.PropertyAnnotation[]) {
    return orderBy(annotations, 'asc', (n) => [
      n.pos.section,
      n.pos.paragraph,
      n.range?.start ?? 0,
    ])
  }

  async annotationsGet(): Promise<BookTypes.PropertyAnnotation[]> {
    const prop = await this.readProp()
    return prop.annotations ?? []
  }

  async annotationsUpsert(annotations: BookTypes.PropertyAnnotation[]) {
    const prop = await this.readProp()
    prop.annotations ??= []
    for (const annotation of annotations) {
      const index = prop.annotations.findIndex(
        (b) => b.uuid === annotation.uuid,
      )
      if (index !== -1) prop.annotations[index] = annotation
      else prop.annotations.push(annotation)
    }
    prop.annotations = this.sortAnnotations(prop.annotations)
    await this.writeProp(prop)
    return prop.annotations
  }

  async annotationsDelete(annotationUuids: string[]) {
    const prop = await this.readProp()
    if (prop.annotations)
      prop.annotations = prop.annotations.filter(
        (b) => !annotationUuids.includes(b.uuid),
      )
    await this.writeProp(prop)
  }

  async annotationsDeleteAll() {
    const prop = await this.readProp()
    if (prop.annotations) prop.annotations = []
    await this.writeProp(prop)
  }
}
