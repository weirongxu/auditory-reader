import mime from 'mime-types'
import { ErrorRequestResponse } from '../../route/session.js'
import type { BookTypes } from '../types.js'

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
  }

  abstract delete(): Promise<void>

  abstract posGet(): Promise<BookTypes.PropertyPosition>

  abstract posSet(pos: BookTypes.PropertyPosition): Promise<void>
}
