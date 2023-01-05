import type { DOMWindow } from 'jsdom'
import JSZip from 'jszip'
import path from 'path'
import { compact } from '../util/collection.js'
import { arrayBufferToBuffer } from '../util/converter.js'
import { XMLDOMLoader } from '../util/xml-dom.js'
import type { BookNav, BookSpine } from './book-base.js'
import { BookBase } from './book-base.js'

type ManifestItem = {
  id: string
  href: string
  mediaType: string
  properties?: string
}

type SpineItem = {
  manifest: ManifestItem
  idref: string
  linear: string
}

// JSDOM unsupported :scope selector

/**
 * Implementation `:scope` selector
 * ```
 * querySelectorAll(':scope>navPoint .class') <=> scopeQuerySelectorAll(dom, ['navPoint'], '.class')
 * querySelectorAll(':scope>navLabel>text .class') <=> scopeQuerySelectorAll(dom, ['navLabel', 'text'], '.class')
 * ```
 */
function* scopeQuerySelectorAll(
  scope: Element,
  childTags: string[],
  selector?: string
): Generator<Element, void, void> {
  if (!childTags.length) {
    if (selector) {
      for (const el of scope.querySelectorAll(selector)) {
        yield el
      }
    } else {
      yield scope
    }
    return
  }
  const [tag, ...remainTags] = childTags
  for (const el of scope.children) {
    if (tag === '*' || el.tagName.toLowerCase() === tag.toLowerCase()) {
      yield* scopeQuerySelectorAll(el, remainTags, selector)
    }
  }
}

export const NAV_TOC_SELECTOR = 'nav[epub\\:type="toc"]'

/**
 * Implementation `:scope` selector
 * ```
 * querySelector(':scope>navPoint') <=> scopeQuerySelector(dom, ['navPoint'])
 * querySelector(':scope>navLabel>text') <=> scopeQuerySelector(dom, ['navLabel', 'text'])
 * ```
 */
function scopeQuerySelector(
  scope: Element,
  childTags: string[],
  selector?: string
): Element | null {
  const first = scopeQuerySelectorAll(scope, childTags, selector).next()
  return first.value ?? null
}

export class BookEpub extends BookBase {
  protected static async getRootPath(xml: XMLDOMLoader) {
    const containerRoot = await xml.dom('META-INF/container.xml')
    if (!containerRoot) return
    const rootfilePath = containerRoot
      .querySelector('rootfile')
      ?.getAttribute('full-path')
    if (!rootfilePath) return
    return path.join('/', rootfilePath)
  }

  static async read(buffer: ArrayBuffer) {
    const zip = await JSZip.loadAsync(buffer)
    const xml = new XMLDOMLoader(zip)
    const rootPath = await this.getRootPath(xml)
    if (!rootPath) return
    const rootDoc = await xml.dom(rootPath)
    if (!rootDoc) return
    return new BookEpub(zip, xml, xml.win(), rootDoc, path.dirname(rootPath))
  }

  protected constructor(
    protected zip: JSZip,
    protected xmlLoader: XMLDOMLoader,
    protected win: DOMWindow,
    protected rootDoc: Document,
    protected rootDir: string
  ) {
    super()
  }

  #pkg?: Element
  protected get pkg(): Element {
    if (!this.#pkg) {
      this.#pkg = this.rootDoc.querySelector('package') ?? undefined
      if (!this.#pkg) throw new Error('package tag not found')
    }
    return this.#pkg
  }

  #version?: 2 | 3
  get version(): 2 | 3 {
    if (!this.#version) {
      const versionStr = this.pkg.getAttribute('version') ?? '2.0'
      this.#version = parseFloat(versionStr) >= 3 ? 3 : 2
    }
    return this.#version
  }

  #language?: string | null
  get language() {
    if (!this.#language) {
      const langElem = this.rootDoc.querySelector('metadata dc\\:language')
      this.#language = langElem?.textContent?.trim() ?? null
    }
    return this.#language
  }

  #manifestItems?: ManifestItem[]
  get manifestItems(): ManifestItem[] {
    if (!this.#manifestItems) {
      this.#manifestItems = [
        ...this.rootDoc.querySelectorAll('manifest>item'),
      ].map((item) => {
        return {
          id: item.getAttribute('id')!,
          href: path.join(this.rootDir, item.getAttribute('href')!),
          mediaType: item.getAttribute('media-type')!,
          properties: item.getAttribute('properties') ?? undefined,
        }
      })
    }
    return this.#manifestItems
  }

  #spine?: Element
  get spine(): Element {
    if (!this.#spine) {
      // spine
      this.#spine = this.rootDoc.querySelector('spine') ?? undefined
      if (!this.#spine) throw new Error('spine not found')
    }
    return this.#spine
  }

  #spineItems?: SpineItem[]
  get spineItems(): SpineItem[] {
    if (!this.#spineItems) {
      this.#spineItems = compact(
        [...this.rootDoc.querySelectorAll('spine>itemref')].map((item) => {
          const idref = item.getAttribute('idref')!
          const manifest = this.manifestItems.find((m) => m.id === idref)
          if (!manifest) return
          return {
            manifest,
            idref,
            linear: item.getAttribute('linear')!,
          }
        })
      )
    }
    return this.#spineItems
  }

  #spines?: BookSpine[]
  get spines(): BookSpine[] {
    if (!this.#spines) {
      this.#spines = this.spineItems.map((s) => ({
        href: s.manifest.href,
        id: s.idref,
      }))
    }
    return this.#spines
  }

  async file(href: string) {
    const file = await this.xmlLoader.file(href)
    if (!file) return
    const arrBuf = await file.arrayBuffer()
    return arrayBufferToBuffer(arrBuf)
  }

  async xml(href: string) {
    return this.xmlLoader.xml(href)
  }

  async dom(href: string) {
    return this.xmlLoader.dom(href)
  }

  dirBySpineIndex(spineIndex: number) {
    return path.dirname(this.spineItems[spineIndex].manifest.href)
  }

  protected getSpineIndexByHref(href: string): number | undefined {
    const spineIndex = this.spineItems.findIndex(
      (s) => s.manifest.href === href
    )
    if (spineIndex === -1) return
    return spineIndex
  }

  protected async loadNav3() {
    const navManifest = this.manifestItems.find((it) => it.properties === 'nav')
    if (!navManifest) return this.loadNav2()
    const dom = await this.dom(navManifest.href)
    if (!dom) return []
    const navRoot = dom.querySelector(`${NAV_TOC_SELECTOR}>ol`)
    if (!navRoot) return []
    return this.parseNav3(navRoot)
  }

  protected parseNav3(dom: Element): BookNav[] {
    const nav: BookNav[] = compact(
      Array.from(scopeQuerySelectorAll(dom, ['li'])).map(
        (el): BookNav | undefined => {
          const elem = Array.from(el.children).find(
            (l) => l.tagName.toLowerCase() !== 'ol'
          )
          if (!elem) return
          const label = elem.textContent ?? ''
          let href: string | undefined
          let hrefBase: string | undefined
          let hrefHash: string | undefined
          let spineIndex: number | undefined
          if (elem.tagName.toLowerCase() === 'a') {
            const src = elem.getAttribute('href')
            if (src) {
              href = path.join(this.rootDir, src)
              ;[hrefBase, hrefHash] = href.split('#', 2)
              spineIndex = this.getSpineIndexByHref(hrefBase)
            }
          }
          const childOl = scopeQuerySelector(el, ['ol'])
          return {
            label,
            href,
            hrefBase,
            hrefHash,
            spineIndex,
            children: childOl ? this.parseNav3(childOl) : [],
          }
        }
      )
    )

    return nav
  }

  protected async loadNav2() {
    const tocId = this.spine.getAttribute('toc') ?? 'ncx'
    const ncxManifest = this.manifestItems.find((it) => it.id === tocId)
    if (!ncxManifest) return []
    const dom = await this.dom(ncxManifest.href)
    if (!dom) return []
    const navRoot = dom.querySelector('navMap')
    if (!navRoot) return []
    return this.parseNav2(navRoot)
  }

  protected parseNav2(dom: Element): BookNav[] {
    const nav: BookNav[] = compact(
      Array.from(scopeQuerySelectorAll(dom, ['navPoint'])).map(
        (el): BookNav | undefined => {
          const label = scopeQuerySelector(el, [
            'navLabel',
            'text',
          ])?.textContent
          if (!label) return
          let href: string | undefined
          let hrefBase: string | undefined
          let hrefHash: string | undefined
          let spineIndex: number | undefined
          const src = scopeQuerySelector(el, ['content'])?.getAttribute('src')
          if (src) {
            href = path.join(this.rootDir, src)
            ;[hrefBase, hrefHash] = href.split('#', 2)
            spineIndex = this.getSpineIndexByHref(hrefBase)
          }
          return {
            label,
            href,
            hrefBase,
            hrefHash,
            spineIndex,
            children: this.parseNav2(el),
          }
        }
      )
    )

    return nav
  }

  #navs?: BookNav[]
  async navs(): Promise<BookNav[]> {
    if (!this.#navs) {
      if (this.version >= 3) {
        this.#navs = await this.loadNav3()
      } else {
        this.#navs = await this.loadNav2()
      }
    }
    return this.#navs
  }
}
