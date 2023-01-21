import { useMountEffect } from '@react-hookz/web'
import type { RefObject } from 'react'
import type { Player } from './player'
import path from 'path'
import type { BookTypes } from '../../../../core/book/types.js'
import type { BookNav } from '../../../../core/book/book-base.js'
import {
  compact,
  findLast,
  minIndexBy,
} from '../../../../core/util/collection.js'
import {
  COLOR_SCHEME_DARK_CLASS,
  IGNORE_TAGS,
  PARA_ACTIVE_CLASS,
  PARA_BLOCK_CLASS,
  PARA_HIGHLIGHT_CLASS,
  PARA_IGNORE_CLASS,
} from '../../../../core/consts.js'
import { getBooksRenderPath } from '../../../../core/api/books/render.js'
import { NAV_TOC_SELECTOR } from '../../../../core/book/book-epub.js'
import { globalStyle } from '../../../../core/style.js'
import { async } from '../../../../core/util/promise.js'
import { urlSplitHash } from '../../../../core/util/url.js'
import type { ReadablePart } from './types.js'
import type { PlayerStatesManager } from './player-states.js'

type ColorScheme = 'light' | 'dark'

function getMatchedNavs(
  pos: BookTypes.PropertyPosition,
  hash: string | undefined = undefined,
  navs: BookNav[],
  parentMatches: BookNav[] = []
): BookNav[] {
  interface RequiredNav extends BookNav {
    spineIndex: number
  }

  const reqNavs = navs.filter(
    (nav): nav is RequiredNav => nav.spineIndex !== undefined
  )
  let nav: RequiredNav | undefined
  nav = reqNavs.find(
    (nav) => nav.spineIndex === pos.section && nav.hrefHash === hash
  )
  if (nav) return [...parentMatches, nav]

  nav = findLast(reqNavs, (nav) => nav.spineIndex <= pos.section)
  if (nav)
    return getMatchedNavs(pos, hash, nav.children, [...parentMatches, nav])

  return []
}

function* walkerNode(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)

  while (true) {
    const curNode = walker.nextNode()
    if (curNode) yield curNode
    else break
  }
}

const isBlockElem = (elem: HTMLElement) => {
  const display = getComputedStyle(elem).getPropertyValue('display')
  return display !== 'inline'
}

const getParentBlockElem = (
  elem: HTMLElement | null
): HTMLElement | undefined => {
  if (!elem) return
  if (isBlockElem(elem)) {
    return elem
  } else if (elem.parentElement) {
    return getParentBlockElem(elem.parentElement)
  }
}

const isAllInlineChild = (elem: HTMLElement) => {
  if (elem.dataset.isAllInlineChild !== undefined) {
    return elem.dataset.isAllInlineChild === '1'
  }
  for (const node of elem.childNodes) {
    if (node instanceof HTMLElement && isBlockElem(node)) {
      elem.dataset.isAllInlineChild = '0'
      return false
    }
  }
  elem.dataset.isAllInlineChild = '1'
  return true
}

function getContentText(elem: HTMLElement) {
  let contentText = ''
  for (const node of walkerNode(elem)) {
    if (!(node instanceof Text)) continue
    if (!node.parentElement) continue
    if (IGNORE_TAGS.includes(node.parentElement.tagName.toLowerCase())) continue
    contentText += node.textContent
  }
  return contentText
}

function getNavHashes(navs: BookNav[]): string[] {
  return navs
    .map((nav) => {
      return compact([nav.hrefHash, ...getNavHashes(nav.children)])
    })
    .flat()
}

const getReadableParts = (doc: Document, navs: BookNav[]) => {
  const blockElemSet = new Set<HTMLElement>()
  const readableParts: ReadablePart[] = []

  const pushTextPart = (elem: HTMLElement) => {
    elem.classList.add(PARA_BLOCK_CLASS)
    const textContent = getContentText(elem)
    const notEmpty = !!textContent?.trim()
    if (notEmpty) {
      readableParts.push({
        elem,
        type: 'text',
        text: textContent,
      })
    }
  }

  const pushImagePart = (elem: HTMLElement) => {
    elem.classList.add(PARA_BLOCK_CLASS)
    readableParts.push({
      elem,
      type: 'image',
    })
  }

  // walk
  for (const node of walkerNode(doc.body)) {
    if (node instanceof HTMLImageElement) {
      pushImagePart(node)
      continue
    }
    if (!(node instanceof Text)) continue
    const content = node.textContent?.trim()
    if (!content) continue
    const blockElem = getParentBlockElem(node.parentElement)
    if (!blockElem) continue

    // skip tag like: ruby > rt
    if (IGNORE_TAGS.includes(blockElem.tagName.toLowerCase())) {
      blockElem.classList.add(PARA_IGNORE_CLASS)
      continue
    }

    // avoid duplicated
    if (blockElemSet.has(blockElem)) continue
    blockElemSet.add(blockElem)

    if (isAllInlineChild(blockElem)) {
      pushTextPart(blockElem)
    } else {
      if (!node.parentElement) continue
      const wrapElem = document.createElement('p')
      node.after(wrapElem)
      wrapElem.appendChild(node)
      pushTextPart(wrapElem)
    }
  }

  // nav hash
  const navHashes = getNavHashes(navs)
  const navHashMap = new Map(
    compact(
      navHashes.map((h) => {
        try {
          const hashTarget = doc.querySelector(`#${h}`)
          const elem = hashTarget?.closest(`.${PARA_BLOCK_CLASS}`)
          if (elem) {
            return [elem, h] as const
          }
        } catch {
          // ignore valid selector
        }
      })
    )
  )
  for (const readablePart of readableParts) {
    readablePart.hash = navHashMap.get(readablePart.elem)
  }
  return readableParts
}

export class PlayerIframeController {
  readableParts: ReadablePart[] = []
  mainContentRootPath: string
  mainContentRootUrl: string
  colorScheme: ColorScheme = 'light'

  get book() {
    return this.player.book
  }

  get iframe() {
    return this.iframeRef.current
  }

  constructor(
    public player: Player,
    public states: PlayerStatesManager,
    public iframeRef: RefObject<HTMLIFrameElement>
  ) {
    this.mainContentRootPath = getBooksRenderPath(this.book.item.uuid, '')

    this.mainContentRootUrl = new URL(
      this.mainContentRootPath,
      location.href
    ).toString()

    this.states.events.on('pos', () => {
      this.paragraphActive()
      this.updateFocusedNavs()
    })
  }

  getAnchorIdElem(anchorId: string) {
    // goto anchorId
    const win = this.iframe?.contentWindow
    if (!win) return
    const doc = win.document
    try {
      const anchorEl = doc.querySelector(`#${anchorId}`)
      if (!anchorEl) return
      return (
        anchorEl.querySelector(`.${PARA_BLOCK_CLASS}`) ??
        anchorEl.closest(`.${PARA_BLOCK_CLASS}`) ??
        anchorEl
      )
    } catch {
      // ignore selector syntax error
    }
  }

  async scrollToCurPos() {
    // goto paragraph
    const item = this.readableParts[this.states.pos.paragraph]
    if (!item) return
    return await new Promise<void>((resolve) => {
      // waiting the page rendered
      setTimeout(() => {
        item.elem.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        })
        resolve()
      }, 10)
    })
  }

  /**
   * @param urlAbsPath absolute path
   * @example
   * ```
   * '/OEBPS/Text/index.html'
   * ```
   */
  async loadByUrl(urlAbsPath: string) {
    const iframe = this.iframe
    if (!iframe) return

    iframe.style.visibility = 'hidden'
    iframe.src = getBooksRenderPath(this.book.item.uuid, urlAbsPath)
    await new Promise<void>((resolve) => {
      iframe.addEventListener(
        'load',
        () => {
          resolve()
        },
        { once: true }
      )
    })

    // load readableParts
    this.readableParts = []
    const doc = iframe.contentDocument
    if (doc) this.readableParts = getReadableParts(doc, this.book.navs)

    this.onLoaded(iframe)
    iframe.style.visibility = 'visible'
  }

  async gotoUrlAndScroll(url: string) {
    const [urlMain, anchorId] = urlSplitHash(url)
    const spineIndex = this.book.spines.findIndex((s) => s.href === urlMain)
    if (spineIndex === -1) return
    await this.loadByUrl(urlMain)

    const targetElem = this.getAnchorIdElem(anchorId)
    if (!targetElem) {
      return
    }

    let elemIndex = this.readableParts.findIndex((el) => el.elem === targetElem)
    if (elemIndex === -1) {
      // Search the nearest element by anchor target element
      const targetElemTop = targetElem.getBoundingClientRect().top
      elemIndex = minIndexBy(this.readableParts, (el) => {
        const rect = el.elem.getBoundingClientRect()
        return rect.top < targetElemTop ? Infinity : rect.top
      })

      if (elemIndex === -1) return
    }

    this.states.pos = {
      section: spineIndex,
      paragraph: elemIndex,
    }
    await this.scrollToCurPos()
  }

  updateColorTheme(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme
    const doc = this.iframe?.contentDocument
    if (!doc) return
    if (colorScheme === 'dark') {
      doc.documentElement.classList.add(COLOR_SCHEME_DARK_CLASS)
    } else {
      doc.documentElement.classList.remove(COLOR_SCHEME_DARK_CLASS)
    }
  }

  onLoaded(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument
    // load inject and hook
    if (doc) {
      this.updateColorTheme(this.colorScheme)
      this.injectCSS(doc)
      this.hookALinks(doc)
      this.hookParagraphClick()
      this.hookHotkeys()
    }
  }

  injectCSS(doc: Document) {
    const styleElem = doc.createElement('style')
    const contentSelectors = [
      'a',
      'article',
      'cite',
      'code',
      'div',
      'li',
      'p',
      'pre',
      'span',
      'table',
      'body',
    ]
    styleElem.innerHTML = `
      ${globalStyle}

      .${COLOR_SCHEME_DARK_CLASS} body {
        background-color: var(--main-bg);
      }

      ${contentSelectors
        .map(
          (s) =>
            `.${COLOR_SCHEME_DARK_CLASS} ${s}:not(.${PARA_HIGHLIGHT_CLASS})`
        )
        .join(', ')} {
        color: var(--main-fg) !important;
      }

      .${PARA_BLOCK_CLASS} {
        cursor: pointer;
      }

      .${PARA_BLOCK_CLASS}.${PARA_ACTIVE_CLASS} {
        background: var(--main-bg-active);
      }

      .${PARA_BLOCK_CLASS}:hover {
        background: var(--main-bg-hover);
      }

      .${PARA_HIGHLIGHT_CLASS} {
        background-color: var(--main-bg-highlight);
        color: var(--main-fg-highlight) !important;
      }
    `
    doc.head.appendChild(styleElem)
  }

  hookALinks(doc: Document) {
    for (const link of doc.querySelectorAll('a')) {
      if (link.getAttribute('target') === '_blank') continue
      if (!link.href) continue

      link.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        async(async () => {
          const isToc = link.closest(NAV_TOC_SELECTOR)
          let rootPath: string
          if (isToc) {
            const href = link.getAttribute('href')
            if (!href) return
            rootPath = path.join('/', href)
          } else {
            const url = link.href
            if (!url) {
              return
            }
            rootPath = url.substring(this.mainContentRootUrl.length)
          }
          await this.gotoUrlAndScroll(rootPath)
          this.player.utterer.cancel()
        })
      })
    }
  }

  hookParagraphClick() {
    const click = (event: Event) => {
      const target = event.currentTarget as Element
      const paraIndex = this.readableParts.findIndex((n) => n.elem === target)
      if (paraIndex !== -1) {
        this.player.gotoParagraph(paraIndex).catch(console.error)
      }
    }
    this.readableParts.forEach((n) => n.elem.addEventListener('click', click))
    return () => {
      this.readableParts.forEach((n) =>
        n.elem.removeEventListener('click', click)
      )
    }
  }

  #hotkeys = new Map([
    [' ', () => this.player.toggle()],
    ['ArrowLeft', () => this.player.prevSection()],
    ['ArrowRight', () => this.player.nextSection()],
    ['ArrowUp', () => this.player.prevParagraph()],
    ['ArrowDown', () => this.player.nextParagraph()],
  ])
  #registeredGlobalHotkey = false
  hookHotkeys() {
    const listener = (e: KeyboardEvent) => {
      if (e.target instanceof Element) {
        const elemName = e.target.tagName.toLowerCase()
        if (['textarea', 'input'].includes(elemName)) return
      }
      if (e.altKey || e.ctrlKey) return
      const cb = this.#hotkeys.get(e.key)
      if (cb) {
        e.preventDefault()
        cb()
      }
    }
    if (!this.#registeredGlobalHotkey) {
      window.addEventListener('keydown', listener)
      this.player.onUnmount(() => {
        window.removeEventListener('keydown', listener)
        this.#registeredGlobalHotkey = false
      })
      this.#registeredGlobalHotkey = true
    }
    this.iframe?.contentWindow?.addEventListener('keydown', listener)
    this.player.onUnmount(() => {
      this.iframe?.contentWindow?.removeEventListener('keydown', listener)
    })
  }

  async firstLoad() {
    const spine = this.book.spines[this.states.pos.section]
    if (spine) {
      await this.loadByUrl(spine.href)
      await this.scrollToCurPos()
    } else {
      const spine = this.book.spines[0]
      await this.loadByUrl(spine.href)
      this.states.pos = {
        section: 0,
        paragraph: 0,
      }
      await this.scrollToCurPos()
    }
    this.paragraphActive()
    this.updateFocusedNavs()
  }

  #paragraphLastActive?: ReadablePart
  paragraphActive() {
    const item = this.readableParts[this.states.pos.paragraph]
    if (
      !item ||
      (this.#paragraphLastActive && item === this.#paragraphLastActive)
    )
      return
    this.#paragraphLastActive?.elem.classList.remove(PARA_ACTIVE_CLASS)
    this.#paragraphLastActive = item
    if (item.elem instanceof Element) {
      item.elem.classList.add(PARA_ACTIVE_CLASS)
    }
  }

  updateFocusedNavs() {
    const readableParts = this.readableParts
    const hash = findLast(
      readableParts.slice(0, this.states.pos.paragraph + 1),
      (part) => Boolean(part.hash)
    )?.hash
    this.states.focusedNavs = new Set(
      getMatchedNavs(this.states.pos, hash, this.book.navs)
    )
  }
}

export function usePlayerIframe(player: Player) {
  useMountEffect(async () => {
    await player.iframeCtrler.firstLoad()
  })
}
