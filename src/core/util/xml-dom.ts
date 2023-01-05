import { JSDOM } from 'jsdom'
// import { DOMParser } from '@xmldom/xmldom'
import JSZip from 'jszip'
import buffer from 'buffer'
import { isBrowser } from './browser.js'

globalThis.Blob = isBrowser ? Blob : (buffer.Blob as unknown as typeof Blob)
JSZip.support.blob = true

export class XMLDOMLoader {
  private jsdom: JSDOM

  constructor(protected zip: JSZip) {
    this.jsdom = new JSDOM('')
  }

  win() {
    return this.jsdom.window
  }

  protected parseToDOM(xml: string) {
    const DOMParser = this.jsdom.window.DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    return doc
  }

  protected getFinalPath(filepath: string) {
    return filepath.startsWith('/') ? filepath.slice(1) : filepath
  }

  async file(filepath: string) {
    const file = this.zip.file(this.getFinalPath(filepath))
    if (!file) return
    return await file.async('blob')
  }

  async xml(filepath: string) {
    const file = this.zip.file(this.getFinalPath(filepath))
    if (!file) return
    return await file.async('string')
  }

  async dom(filepath: string) {
    const xml = await this.xml(filepath)
    if (!xml) return
    const dom = this.parseToDOM(xml)
    return dom
  }
}
