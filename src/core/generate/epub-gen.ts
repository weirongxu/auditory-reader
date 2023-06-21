import dedent from 'dedent'
import JSZip from 'jszip'
import { PARA_IGNORE_CLASS } from '../consts.js'

export class EpubGen {
  zip: JSZip

  constructor(
    private readonly options: {
      uuid: string
      title: string
      lang: string
      htmlContent: string
      date: Date
      publisher: string
      sourceURL?: string
    }
  ) {
    this.zip = new JSZip()
  }

  genContainer() {
    this.zip.file(
      'META-INF/container.xml',
      dedent`
        <?xml version="1.0"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
            <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
        </container>
      `
    )
  }

  genContentOpf() {
    this.zip.file(
      'content.opf',
      dedent`
        <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="3.0" >
          <metadata
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:dcterms="http://purl.org/dc/terms/"
            xmlns:opf="http://www.idpf.org/2007/opf"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <dc:title>${this.options.title}</dc:title>
            <dc:creator>unknown</dc:creator>
            <dc:language>${this.options.lang}</dc:language>
            <dc:date>${this.options.date.toISOString()}</dc:date>
            <dc:publisher>${this.options.publisher}</dc:publisher>
          </metadata>
          <manifest>
            <item href="page-styles.css" id="page-styles" media-type="text/css"/>
            <item href="stylesheet.css" id="stylesheet" media-type="text/css"/>
            <item href="text/content.html" id="html-content" media-type="application/xhtml+xml"/>
          </manifest>
          <spine>
            <itemref idref="html-content"/>
          </spine>
        </package>
      `
    )
  }

  genStyle() {
    this.zip.file(
      'page-styles.css',
      dedent`
        @page {
          margin-bottom: 5pt;
          margin-top: 5pt
        }
      `
    )
    this.zip.file(
      'stylesheet.css',
      dedent`
        rt {
          user-select: none;
        }
        img {
          max-width: 100%;
        }
      `
    )
  }

  genContentHTML() {
    this.zip.file(
      'text/content.html',
      dedent`
        <?xml version='1.0' encoding='utf-8'?>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${
          this.options.lang
        }">
          <head>
            <title>${this.options.title}</title>
            <link href="../stylesheet.css" rel="stylesheet" type="text/css"/>
            <link href="../page-styles.css" rel="stylesheet" type="text/css"/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
          </head>
          <body>
            ${
              this.options.sourceURL
                ? `<p class="${PARA_IGNORE_CLASS}"><a target="_blank" href="${this.options.sourceURL}">
                  ${this.options.sourceURL}
                </a></p>`
                : ''
            }
            <h1>${this.options.title}</h1>
            ${this.options.htmlContent}
          </body>
        </html>
      `
    )
  }

  async gen() {
    this.zip.file('mimetype', 'application/epub+zip')
    this.genContainer()
    this.genContentOpf()
    this.genStyle()
    this.genContentHTML()

    return await this.zip.generateAsync({ type: 'arraybuffer' })
  }
}
