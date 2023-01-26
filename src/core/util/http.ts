import { JSDOM } from 'jsdom'

export async function fetchHtml(url: string) {
  const res = await fetch(url)
  return await res.text()
}

export async function fetchDom(url: string) {
  const html = await fetchHtml(url)
  const jsdom = new JSDOM(html)
  return jsdom
}
