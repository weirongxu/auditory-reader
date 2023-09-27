import { splitParagraph } from '../util/text.js'
import type { BookFile, BookNav, BookSpine } from './book-base.js'
import { BookBase } from './book-base.js'

export class BookText extends BookBase {
  static async read(text: string, title: string) {
    let html = splitParagraph(text)
      .map((p) => `<p>${p}</p>`)
      .join('\r\n')
    html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
    </head>
    <body>
      ${html}
    </body>
    </html>
    `
    return new BookText(text, html)
  }

  constructor(
    public readonly text: string,
    public readonly html: string,
  ) {
    super()
  }

  spines: BookSpine[] = [
    {
      href: '/main.html',
      id: 'main',
    },
  ]

  async navs(): Promise<BookNav[]> {
    return []
  }

  async file(): Promise<BookFile | undefined> {
    return {
      buffer: Buffer.from(this.html, 'utf8'),
    }
  }

  async cover() {
    return undefined
  }
}
