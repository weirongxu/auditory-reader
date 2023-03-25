import { isUrl } from './url.js'

export function isInputElement(element: any) {
  if (element instanceof Element) {
    const elemName = element.tagName.toLowerCase()
    if (['textarea', 'input'].includes(elemName)) return true
  }
  return false
}

export async function HTMLImgs2DataURL(
  urlStr: string,
  element: HTMLElement,
  options: { referrer?: string } = {}
) {
  const url = new URL(urlStr)
  const imgs = [...element.querySelectorAll('img')]
  const headers = new Headers({
    ...(options.referrer ? { Referer: options.referrer ?? undefined } : {}),
  })
  for (const img of imgs) {
    let src = img.src || img.getAttribute('data-src')
    if (!src) continue
    try {
      if (src.startsWith('//')) {
        src = `${url.protocol}:${src}`
      }
      if (!isUrl(src)) return
      const res = await fetch(src, {
        headers,
      })
      const contentType = res.headers.get('Content-Type')
      const buf = await res.arrayBuffer()
      img.src = `data:${contentType};base64,${Buffer.from(buf).toString(
        'base64'
      )}`
    } catch (err) {
      console.error(err)
    }
  }
}

export async function SVGImgs2DataURL(
  svgElement: SVGSVGElement,
  options: { referrer?: string; baseURL?: string } = {}
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
        `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`
      )
    } catch (err) {
      console.error(err)
    }
  }
}

export async function svgToDataUri(svgElement: SVGSVGElement, baseURL: string) {
  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement
  await SVGImgs2DataURL(clonedSvg, { baseURL })
  clonedSvg.setAttribute('width', `${svgElement.clientWidth}px`)
  const xml = new XMLSerializer().serializeToString(clonedSvg)
  svgElement.cloneNode()
  const svg64 = window.btoa(xml)
  return `data:image/svg+xml;base64,${svg64}`
}
