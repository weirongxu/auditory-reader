export type BookNav = {
  /** root (minimun) level is 1 */
  level: number
  label: string
  href?: string
  hrefBase?: string
  hrefHash?: string
  spineIndex?: number
  children: BookNav[]
}

export type BookSpine = {
  id: string
  href: string
}

export abstract class BookBase {
  abstract readonly spines: BookSpine[]

  abstract navs(): Promise<BookNav[]>

  abstract file(href: string): Promise<Buffer | undefined>
}
