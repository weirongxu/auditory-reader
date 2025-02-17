import path from '@file-services/path'
import JSZip from 'jszip'
import { compact } from '../util/collection.js'
import type { XMLElem } from '../util/xml-dom.js'
import { XMLDOMLoader } from '../util/xml-dom.js'
import type { BookTypes } from './types.js'

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
  selector?: string,
): Generator<Element, undefined, void> {
  const [tag, ...remainTags] = childTags
  if (!tag) {
    if (selector) {
      for (const el of scope.querySelectorAll(selector)) {
        yield el
      }
    } else {
      yield scope
    }
    return
  }
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
  selector?: string,
): Element | null {
  const first = scopeQuerySelectorAll(scope, childTags, selector).next()
  return first.value ?? null
}

export class BookEpub {
  protected static async getRootPath(xml: XMLDOMLoader) {
    const containerRoot = await xml.htmlDom('META-INF/container.xml')
    if (!containerRoot) {
      console.error('Parse META-INF/container.xml error')
      return
    }
    const rootfilePath = containerRoot
      .querySelector('rootfile')
      ?.getAttribute('full-path')
    if (!rootfilePath) {
      console.error('rootfile full-path not found')
      return
    }
    return path.join('/', rootfilePath)
  }

  static async read(buffer: ArrayBuffer): Promise<BookEpub | undefined> {
    const zip = await JSZip.loadAsync(buffer)
    const xml = new XMLDOMLoader(zip)
    const rootPath = await this.getRootPath(xml)
    if (!rootPath) {
      console.error(`epub root-path(${rootPath}) not found`)
      return
    }
    const rootDoc = await xml.xmlDom(rootPath)
    if (!rootDoc) {
      console.error(`epub root document not found`)
      return
    }
    return new BookEpub(zip, xml, rootDoc, path.dirname(rootPath))
  }

  protected constructor(
    protected zip: JSZip,
    protected xmlLoader: XMLDOMLoader,
    protected rootPkg: XMLElem,
    protected rootDir: string,
  ) {}

  #version?: 2 | 3
  get version(): 2 | 3 {
    if (!this.#version) {
      const versionStr = this.rootPkg.getAttribute('version') ?? '2.0'
      this.#version = parseFloat(versionStr) >= 3 ? 3 : 2
    }
    return this.#version
  }

  #title?: string | null
  get title() {
    if (!this.#title) {
      const titleElem = this.rootPkg
        .findDescendant('metadata')
        ?.findDescendant('dc:title')
      this.#title = titleElem?.text()?.trim() ?? null
    }
    return this.#title
  }

  #language?: string | null
  get language() {
    if (!this.#language) {
      const langElem = this.rootPkg
        .findDescendant('metadata')
        ?.findDescendant('dc:language')
      this.#language = langElem?.text()?.trim() ?? null
    }
    return this.#language
  }

  #manifestItems?: BookTypes.ManifestItem[]
  get manifestItems(): BookTypes.ManifestItem[] {
    if (!this.#manifestItems) {
      const items =
        this.rootPkg.findDescendant('manifest')?.childrenFilter('item') ?? []
      this.#manifestItems = items.map((item) => {
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

  #spine?: XMLElem
  get spine(): XMLElem {
    if (!this.#spine) {
      // spine
      this.#spine = this.rootPkg.findDescendant('spine') ?? undefined
      if (!this.#spine) throw new Error('spine not found')
    }
    return this.#spine
  }

  #spineItems?: BookTypes.SpineItem[]
  get spineItems(): BookTypes.SpineItem[] {
    if (!this.#spineItems) {
      this.#spineItems = compact(
        [...this.spine.childrenFilter('itemref')].map((item) => {
          const idref = item.getAttribute('idref')!
          const manifest = this.manifestItems.find((m) => m.id === idref)
          if (!manifest) return
          return {
            manifest,
            idref,
            linear: item.getAttribute('linear')!,
          }
        }),
      )
    }
    return this.#spineItems
  }

  #spines?: BookTypes.Spine[]
  get spines(): BookTypes.Spine[] {
    if (!this.#spines) {
      this.#spines = this.spineItems.map((s) => ({
        href: s.manifest.href,
        id: s.idref,
      }))
    }
    return this.#spines
  }

  async file(href: string): Promise<BookTypes.File | undefined> {
    const file = await this.xmlLoader.file(href)
    if (!file) return
    const arrBuf = await file.arrayBuffer()
    const absHref = href.startsWith('/') ? href : `/${href}`
    const manifest = this.manifestItems.find((item) => item.href == absHref)
    return { buffer: arrBuf, mediaType: manifest?.mediaType }
  }

  async cover(): Promise<BookTypes.File | undefined> {
    const coverElem = this.rootPkg
      .findDescendant('metadata')
      ?.findDescendants('meta')
      .find((node) => node.getAttribute('name') === 'cover')
    if (!coverElem) return
    const coverId = coverElem.getAttribute('content')
    if (!coverId) return
    const manifest = this.manifestItems.find((item) => item.id === coverId)
    if (!manifest?.href) return
    const file = await this.xmlLoader.file(manifest.href)
    if (!file) return
    const buffer = await file.arrayBuffer()
    return {
      buffer,
      mediaType: manifest.mediaType,
    }
  }

  async content(href: string) {
    return this.xmlLoader.content(href)
  }

  async xmlDom(href: string) {
    return this.xmlLoader.xmlDom(href)
  }

  async htmlDom(href: string) {
    return this.xmlLoader.htmlDom(href)
  }

  dirBySpineIndex(spineIndex: number) {
    const spine = this.spineItems[spineIndex]
    if (spine) return path.dirname(spine.manifest.href)
  }

  protected getSpineIndexByHref(href: string): number | undefined {
    const spineIndex = this.spineItems.findIndex(
      (s) => s.manifest.href === href,
    )
    if (spineIndex === -1) return
    return spineIndex
  }

  protected async loadNav3() {
    const navManifest = this.manifestItems.find((it) => it.properties === 'nav')
    if (!navManifest) return this.loadNav2()
    const navDom = await this.htmlDom(navManifest.href)
    const navDir = path.dirname(navManifest.href)
    if (!navDom) return []
    const navRoot = navDom.querySelector(`${NAV_TOC_SELECTOR}>ol`)
    if (!navRoot) return []
    return this.parseNav3(navRoot, navDir)
  }

  protected parseNav3(dom: Element, dir: string, level = 1): BookTypes.Nav[] {
    const nav: BookTypes.Nav[] = compact(
      Array.from(scopeQuerySelectorAll(dom, ['li'])).map(
        (el): BookTypes.Nav | undefined => {
          const elem = Array.from(el.children).find(
            (l) => l.tagName.toLowerCase() !== 'ol',
          )
          if (!elem) return
          const label = elem.textContent ?? ''
          let href: string | undefined
          let hrefBase: string | undefined
          let hrefAnchor: string | undefined
          let spineIndex: number | undefined
          if (elem.tagName.toLowerCase() === 'a') {
            const src = elem.getAttribute('href')
            if (src) {
              href = path.join(dir, src)
              ;[hrefBase, hrefAnchor] = href.split('#', 2)
              if (hrefBase) spineIndex = this.getSpineIndexByHref(hrefBase)
            }
          }
          const childOl = scopeQuerySelector(el, ['ol'])
          return {
            level,
            label,
            href,
            hrefBase,
            hrefAnchor,
            spineIndex,
            children: childOl ? this.parseNav3(childOl, dir, level + 1) : [],
          }
        },
      ),
    )

    return nav
  }

  protected async loadNav2() {
    const tocId = this.spine.getAttribute('toc') ?? 'ncx'
    const ncxManifest = this.manifestItems.find((it) => it.id === tocId)
    if (!ncxManifest) return []
    const navDom = await this.xmlDom(ncxManifest.href)
    const navDir = path.dirname(ncxManifest.href)
    if (!navDom) return []
    const navRoot = navDom.findDescendant('navMap')
    if (!navRoot) return []
    return this.parseNav2(navRoot, navDir)
  }

  protected parseNav2(dom: XMLElem, dir: string, level = 1): BookTypes.Nav[] {
    const nav: BookTypes.Nav[] = compact(
      dom.childrenFilter('navPoint').map((el): BookTypes.Nav | undefined => {
        const label = el.findChild('navLabel')?.findChild('text')?.text()
        if (!label) return
        let href: string | undefined
        let hrefBase: string | undefined
        let hrefAnchor: string | undefined
        let spineIndex: number | undefined
        const src = el.findChild('content')?.getAttribute('src')
        if (src) {
          href = path.join(dir, src)
          ;[hrefBase, hrefAnchor] = href.split('#', 2)
          if (hrefBase) spineIndex = this.getSpineIndexByHref(hrefBase)
        }
        return {
          level,
          label,
          href,
          hrefBase,
          hrefAnchor,
          spineIndex,
          children: this.parseNav2(el, dir, level + 1),
        }
      }),
    )

    return nav
  }

  #navs?: BookTypes.Nav[]
  async navs(): Promise<BookTypes.Nav[]> {
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
