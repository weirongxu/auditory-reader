export type BookNav = {
  /** root (minimun) level is 1 */
  level: number
  label: string
  href?: string
  hrefBase?: string
  hrefAnchor?: string
  spineIndex?: number
  children: BookNav[]
}

export type BookSpine = {
  id: string
  href: string
}

export type BookFile = {
  buffer: Buffer
  mediaType?: string
}

export abstract class BookBase {
  abstract readonly spines: BookSpine[]

  abstract navs(): Promise<BookNav[]>

  abstract file(href: string): Promise<BookFile | undefined>

  abstract cover(): Promise<BookFile | undefined>
}
