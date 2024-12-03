import { v1 as uuidv1 } from 'uuid'
import { getArticleXml, jsDOMParser } from '../util/dom.js'
import { splitParagraph } from '../util/text.js'
import { EpubGen } from './epub-gen.js'
import type { LangCode } from '../lang.js'
import { appName } from '../consts.js'

export async function textToEpub(
  text: string,
  title: string,
  langCode: LangCode,
) {
  let body = splitParagraph(text)
    .map((p) => `<p>${p}</p>`)
    .join('\r\n')
  body = text
    .replace(/<p>/g, '<p class="para">')
    .replace(/<h1>/g, '<h1 class="heading">')

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
  </head>
  <body>
    ${body}
  </body>
  </html>
  `

  return await htmlToEpub(html, langCode)
}

export async function htmlToEpub(
  html: string,
  langCode: LangCode,
  baseURL?: string,
) {
  const dom = jsDOMParser(html)
  const articleContent = await getArticleXml(dom.doc)

  const uuid = uuidv1()
  const date = new Date()

  const epubBuffer = await new EpubGen({
    title: dom.doc.title,
    date,
    htmlContent: articleContent,
    lang: langCode,
    publisher: appName,
    sourceURL: baseURL,
    uuid,
  }).gen()

  return epubBuffer
}
