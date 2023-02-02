import { JSDOM } from 'jsdom'

export function isInputElement(element: any) {
  if (element instanceof Element) {
    const elemName = element.tagName.toLowerCase()
    if (['textarea', 'input'].includes(elemName)) return true
  }
  return false
}

export async function base64HTMLImgs(
  html: string,
  options: { referrer?: string } = {}
) {
  const jsdom = new JSDOM(html)
  const doc = jsdom.window.document
  const imgs = [...doc.querySelectorAll('img')]
  const headers = new Headers({
    ...(options.referrer ? { Referer: options.referrer ?? undefined } : {}),
  })
  for (const img of imgs) {
    const src = img.src || img.getAttribute('data-src')
    if (!src) continue
    try {
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
  return doc.body.innerHTML
}
