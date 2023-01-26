import JSZip from 'jszip'

export async function createEpubBy({
  title,
  lang,
  htmlContent,
  date,
  publisher,
}: {
  uuid: string
  title: string
  lang: string
  htmlContent: string
  date: Date
  publisher: string
}) {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip')
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
  `
  )
  zip.file(
    'content.opf',
    `<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="3.0" >
  <metadata
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:opf="http://www.idpf.org/2007/opf"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title id="id">${title}</dc:title>
    <dc:creator id="id-1">unknown</dc:creator>
    <dc:language>${lang}</dc:language>
    <dc:date>${date.toISOString()}</dc:date>
    <dc:publisher>${publisher}</dc:publisher>
  </metadata>
  <manifest>
    <item href="content.html" id="html_content" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="html_content"/>
  </spine>
</package>
`
  )
  zip.file(
    'content.html',
    `<?xml version='1.0' encoding='utf-8'?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}">
  <head>
    <title>${title}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  </head>
  <body>
  ${htmlContent}
  </body>
</html>
`
  )

  return await zip.generateAsync({ type: 'arraybuffer' })
}
