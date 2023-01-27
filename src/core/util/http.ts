import { JSDOM } from 'jsdom'
import { ErrorRequestResponse } from '../route/session.js'

export async function fetchHtml(url: string) {
  try {
    const res = await fetch(url)
    return await res.text()
  } catch (err) {
    const msg = err instanceof Error ? err.message : err?.toString()
    throw new ErrorRequestResponse(msg)
  }
}

export async function fetchDom(url: string) {
  const html = await fetchHtml(url)
  const jsdom = new JSDOM(html)
  return jsdom
}
