import type { BookTypes } from '../types.js'

export abstract class BookEntityBase {
  constructor(public readonly entity: BookTypes.Entity) {}

  abstract readFileBuffer(): Promise<ArrayBuffer>

  abstract readFileText(): Promise<string>

  abstract delete(): Promise<void>

  abstract posGet(): Promise<BookTypes.PropertyPosition>

  abstract posSet(pos: BookTypes.PropertyPosition): Promise<void>
}
