import type { JSDOM, DOMWindow } from 'jsdom'
import { isUrl } from './url.js'
import { Readability } from '@mozilla/readability'
import { env } from '../env.js'

export type DOMView = DOMWindow

const viewSym = Symbol('DOMView')

export function isInputElement(element: any): element is Element {
  if (element instanceof Element) {
    const elemName = element.tagName.toLowerCase()
    if (['textarea', 'input'].includes(elemName)) return true
  }
  return false
}

export function jsDOMParser(xml: string): {
  view: DOMView
  doc: Document
} {
  const dom: JSDOM =
    // @ts-ignore
    new globalThis.JSDOM('', { pretendToBeVisual: true })
  const DOMParser = dom.window.DOMParser
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/html')
  // @ts-ignore
  doc[viewSym] = dom.window
  return { view: dom.window, doc }
}

export function getDomView(node: any): DOMView | undefined {
  return (
    node?.defaultView ||
    node?.ownerDocument?.defaultView ||
    node?.ownerDocument?.[viewSym]
  )
}

export function requiredDomView(node: any): DOMView {
  const view = getDomView(node)
  if (!view) throw new Error('no dom view')
  return view
}

export function isTextNode(node: any): node is Text {
  const view = getDomView(node)
  return !!view && node instanceof view.Text
}

export function isElement(node: any): node is HTMLElement {
  const view = getDomView(node)
  return !!view && node instanceof view.HTMLElement
}

export function isImageElement(node: any): node is HTMLImageElement {
  const view = getDomView(node)
  return !!view && node instanceof view.HTMLImageElement
}

export function isAnchorElement(node: any): node is HTMLAnchorElement {
  const view = getDomView(node)
  return !!view && node instanceof view.HTMLAnchorElement
}

export async function getArticleXml(doc: Document, baseURL?: string) {
  const article = new Readability(doc).parse()

  if (!article) throw new Error('parse article error')

  const articleDom = jsDOMParser(article.content)
  const articleDoc = articleDom.doc

  if (env.appMode === 'server')
    await htmlImgs2DataURL(articleDoc.body, { baseURL })

  return serializeBodyXml(articleDom)
}

function serializeBodyXml({ view, doc }: { view: DOMView; doc: Document }) {
  const nodes = Array.from(doc.body.childNodes)
  let content = ''
  for (const node of nodes) {
    if (node.nodeType === view.Node.TEXT_NODE) {
      content += node.textContent
    } else {
      content += new view.XMLSerializer().serializeToString(node)
    }
  }
  return content
}

export async function htmlImgs2DataURL(
  element: HTMLElement,
  options: { referrer?: string; baseURL?: string } = {},
) {
  const baseURL = options.baseURL ? new URL(options.baseURL) : undefined
  const imgs = [...element.querySelectorAll('img')]
  const headers = new Headers({
    ...(options.referrer ? { Referer: options.referrer ?? undefined } : {}),
  })
  for (const img of imgs) {
    let src =
      img.src ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-original')
    if (!src) continue
    if (src.startsWith('data:')) continue
    try {
      if (src.startsWith('//') && baseURL) {
        src = `${baseURL.protocol}:${src}`
      }
      if (!isUrl(src)) return
      const res = await fetch(src, {
        headers,
      })
      const contentType = res.headers.get('Content-Type')
      const buf = await res.arrayBuffer()
      img.src = `data:${contentType};base64,${Buffer.from(buf).toString(
        'base64',
      )}`
    } catch (err) {
      console.error(err)
    }
  }
}

export async function svgImgs2DataURL(
  svgElement: SVGSVGElement,
  options: { referrer?: string; baseURL?: string } = {},
) {
  const imgs = [...svgElement.querySelectorAll('image')]
  const headers = new Headers({
    ...(options.referrer ? { Referer: options.referrer ?? undefined } : {}),
  })
  for (const img of imgs) {
    const relativeSrc = img.href.baseVal
    if (!relativeSrc) continue
    const src = options.baseURL
      ? new URL(relativeSrc, options.baseURL)
      : relativeSrc
    try {
      const res = await fetch(src, {
        headers,
      })
      const contentType = res.headers.get('Content-Type')
      const buf = await res.arrayBuffer()
      img.setAttribute(
        'href',
        `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`,
      )
    } catch (err) {
      console.error(err)
    }
  }
}

export async function svgToDataUri(
  svgElement: SVGSVGElement,
  baseURL?: string,
) {
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement
  await svgImgs2DataURL(clonedSvg, { baseURL })
  clonedSvg.setAttribute('width', `${svgElement.clientWidth}px`)
  const xml = new XMLSerializer().serializeToString(clonedSvg)
  svgElement.cloneNode()
  const svg64 = window.btoa(xml)
  return `data:image/svg+xml;base64,${svg64}`
}

export function eventBan(event: Event | React.FormEvent<HTMLElement>) {
  event.preventDefault()
  event.stopPropagation()
}
