import buffer from 'buffer'
import * as htmlparser2 from 'htmlparser2'
import { JSDOM } from 'jsdom'
import JSZip from 'jszip'
import { isBrowser } from './browser.js'
import { compact } from './collection.js'

globalThis.Blob = isBrowser ? Blob : (buffer.Blob as unknown as typeof Blob)
JSZip.support.blob = true

export type XMLNode = XMLElement | string

export type XMLElement = {
  name: string
  attributes: Record<string, string | undefined>
  children?: XMLNode[]
}

export class XMLDOMLoader {
  private jsdom: JSDOM

  constructor(protected zip: JSZip) {
    this.jsdom = new JSDOM('')
  }

  protected htmlToDOM(xml: string) {
    const DOMParser = this.jsdom.window.DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/html')
    return doc
  }

  protected async xmlToDOM(xml: string) {
    const doc = await parseXML(xml)
    return new XMLElem(doc)
  }

  protected getFinalPath(filepath: string) {
    return filepath.startsWith('/') ? filepath.slice(1) : filepath
  }

  async file(filepath: string) {
    const file = this.zip.file(this.getFinalPath(filepath))
    if (!file) return
    return await file.async('blob')
  }

  async content(filepath: string) {
    const file = this.zip.file(this.getFinalPath(filepath))
    if (!file) return
    return await file.async('string')
  }

  async htmlDom(filepath: string) {
    const xml = await this.content(filepath)
    if (!xml) return
    const dom = this.htmlToDOM(xml)
    return dom
  }

  async xmlDom(filepath: string) {
    const xml = await this.content(filepath)
    if (!xml) return
    const dom = await this.xmlToDOM(xml)
    return dom
  }
}

export function parseXML(xmlText: string) {
  return new Promise<XMLElement>((resolve, reject) => {
    // the full parsed object.
    let parsed: XMLElement
    // the current node being parsed.
    let current: XMLElement
    // stack of nodes leading to the current one.
    const stack: XMLElement[] = []

    const parser = new htmlparser2.Parser(
      {
        ontext(text) {
          if (!current) return
          current.children ??= []
          current.children.push(text)
        },
        onopentag(name, attributes) {
          const child = {
            name,
            attributes,
            children: undefined,
          }
          if (current) {
            current.children ??= []
            current.children.push(child)
          } else {
            parsed = child
          }

          stack.push(child)
          current = child
        },
        onclosetag() {
          stack.pop()
          current = stack[stack.length - 1]
        },
        onend() {
          resolve(parsed)
        },
        onerror(error) {
          reject(error)
        },
      },
      { xmlMode: true }
    )

    parser.write(xmlText)

    parser.end()
  })
}

export class XMLElem {
  protected static getDescendantsText(node: XMLNode): string | undefined {
    if (typeof node === 'string') return node
    if (!node.children) return
    let text = ''
    for (const c of node.children) {
      text += this.getDescendantsText(c)
    }
    return text
  }

  get tagName() {
    return this.node.name
  }

  constructor(public node: XMLElement) {}

  getAttribute(attributeName: string): string | undefined {
    return this.node.attributes[attributeName]
  }

  text(): string | undefined {
    return XMLElem.getDescendantsText(this.node)
  }

  children(): XMLElem[] {
    return compact(
      this.node.children?.map((n) =>
        typeof n === 'object' ? new XMLElem(n) : undefined
      ) ?? []
    )
  }

  childrenFilter(tagName: string) {
    return this.children().filter((c) => c.tagName === tagName)
  }

  /**
   * Find a child with the given name.
   * @param tagName - The name to find.
   */
  findChild(tagName: string): XMLElem | undefined {
    return this.children().find((it) => it.tagName === tagName)
  }

  /**
   * Find all descendants with the given name.
   * @param tagName - The name to find.
   */
  findDescendants(tagName: string): XMLElem[] {
    const foundNodes: XMLElem[] = []
    for (const elem of this.children()) {
      if (elem.tagName === tagName) foundNodes.push(elem)
      foundNodes.push(...elem.findDescendants(tagName))
    }
    return foundNodes
  }

  /**
   * Find a descendant with the given name.
   * @param tagName - The name to find.
   */
  findDescendant(tagName: string): XMLElem | undefined {
    for (const elem of this.children()) {
      if (elem.tagName === tagName) return elem
      const found = elem.findDescendant(tagName)
      if (found) return found
    }
  }
}
