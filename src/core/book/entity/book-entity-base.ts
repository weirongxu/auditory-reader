import mime from 'mime-types'
import { ErrorRequestResponse } from '../../route/session.js'
import type { BookTypes } from '../types.js'
import { orderBy } from '../../util/collection.js'
import { getBookExtension } from '../../util/book.js'

export abstract class BookEntityBase {
  constructor(public readonly entity: BookTypes.EntityRaw) {}

  abstract readFileBuffer(): Promise<ArrayBuffer>

  abstract readFileText(): Promise<string>

  async download(): Promise<{
    contentType: string
    buffer: ArrayBuffer
    filename: string
  }> {
    const buffer = await this.readFileBuffer()
    const unknownHint = 'Book type unknown'
    const extname: string | undefined = getBookExtension()
    if (!extname) throw new ErrorRequestResponse(unknownHint)
    const contentType: string | false = mime.contentType(extname)
    if (!contentType) throw new ErrorRequestResponse(unknownHint)
    const filename = this.entity.name + extname
    return { contentType, buffer, filename }
  }

  async reset() {
    await this.posSet({
      section: 0,
      paragraph: 0,
    })
    await this.annotationsDeleteAll()
  }

  abstract delete(): Promise<void>

  abstract readProp(): Promise<BookTypes.PropertyJson>

  abstract writeProp(prop: BookTypes.PropertyJson): Promise<void>

  /**
   * @deprecated
   */
  async posGet(): Promise<BookTypes.PropertyPosition | undefined> {
    const prop = await this.readProp()
    return prop.position
  }

  /**
   * @deprecated
   */
  async posSet(pos: BookTypes.PropertyPosition): Promise<void> {
    const prop = await this.readProp()
    prop.position = pos
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

  private sortKeywords(keywords: BookTypes.PropertyKeyword[]) {
    return orderBy(keywords, 'asc', (n) => [
      n.pos.section,
      n.pos.paragraph,
      n.keyword,
    ])
  }

  async keywordsGet() {
    const prop = await this.readProp()
    return prop.keywords ?? []
  }

  async keywordsUpsert(keywords: BookTypes.PropertyKeyword[]) {
    const prop = await this.readProp()
    prop.keywords ??= []
    for (const keyword of keywords) {
      const index = prop.keywords.findIndex((b) => b.uuid === keyword.uuid)
      if (index !== -1) prop.keywords[index] = keyword
      else prop.keywords.push(keyword)
    }
    prop.keywords = this.sortKeywords(prop.keywords)
    await this.writeProp(prop)
    return prop.keywords
  }

  async keywordsDelete(keywordUuids: string[]) {
    const prop = await this.readProp()
    if (prop.keywords)
      prop.keywords = prop.keywords.filter(
        (b) => !keywordUuids.includes(b.uuid),
      )
    await this.writeProp(prop)
  }
}
