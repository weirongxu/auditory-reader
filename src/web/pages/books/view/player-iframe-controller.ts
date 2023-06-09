import { useMountEffect } from '@react-hookz/web'
import path from 'path'
import type { RefObject } from 'react'
import { getBooksRenderPath } from '../../../../core/api/books/render.js'
import type { BookNav } from '../../../../core/book/book-base.js'
import { NAV_TOC_SELECTOR } from '../../../../core/book/book-epub.js'
import {
  COLOR_SCHEME_DARK_CLASS,
  COLUMN_BREAK_CLASS,
  IMG_MAX_HEIGHT_CLASS,
  IMG_MAX_WIDTH_CLASS,
  PARA_ACTIVE_CLASS,
  PARA_BOX_CLASS,
  PARA_HIGHLIGHT_CLASS,
} from '../../../../core/consts.js'
import {
  find,
  findLast,
  findLastIndex,
  findLastPair,
  findPair,
  range,
} from '../../../../core/util/collection.js'
import { isInputElement, svgToDataUri } from '../../../../core/util/dom.js'
import { async, sleep } from '../../../../core/util/promise.js'
import { debounceFn } from '../../../../core/util/timer.js'
import { urlSplitHash } from '../../../../core/util/url.js'
import { setHotkeyIframeWin } from '../../../hotkey/hotkey-state.js'
import { setPreviewImgSrc } from '../../../preview-image.js'
import { globalStyle } from '../../../style.js'
import type { Player } from './player'
import type { PlayerStatesManager } from './player-states.js'
import type { ReadablePart } from './types.js'
import { getReadableParts } from './utils/readable.js'

type ColorScheme = 'light' | 'dark'

type SplitPageNode = {
  top?: {
    paragraph: number
    readablePart: ReadablePart
  }
  scrollLeft: number
}

type ScrollOptions = {
  iteration?: number
  duration?: number
  /**
   * @default true
   */
  animated?: boolean
  /**
   * @default 'center'
   */
  position?: 'center' | 'nearest'
  abortCtrl?: AbortController
}

export class PlayerIframeController {
  readableParts: ReadablePart[] = []
  mainContentRootPath: string
  mainContentRootUrl: string
  colorScheme: ColorScheme = 'light'
  splitPageCount?: number
  splitPageWidth?: number
  splitPageList?: SplitPageNode[]
  splitPageCurPageIndex?: number
  splitPageCurPage?: SplitPageNode
  splitPageFocusedNode?: {
    paragraph: number
    readablePart: ReadablePart
  }
  win?: Window
  doc?: Document
  scrollContainer?: HTMLElement
  #curAbsPath?: string
  #isVertical = false

  get book() {
    return this.player.book
  }

  get bookType() {
    return this.book.item.isTmp ? 'tmp' : 'book'
  }

  get iframe() {
    return this.iframeRef.current
  }

  get isSplitPage() {
    if (this.states.splitPage === 'none') return false
    return !this.#isVertical
  }

  constructor(
    protected player: Player,
    protected states: PlayerStatesManager,
    protected iframeRef: RefObject<HTMLIFrameElement>
  ) {
    this.mainContentRootPath = getBooksRenderPath(
      this.bookType,
      this.book.item.uuid,
      ''
    )

    this.mainContentRootUrl = new URL(
      this.mainContentRootPath,
      location.href
    ).toString()

    this.states.events.on('pos', () => {
      this.paragraphActive()
      this.updateFocusedNavs()
      this.updateSplitPageFocusedNode()
    })

    let firstSplitPageChanged = true
    this.states.uiEvents.on('splitPage', async () => {
      if (firstSplitPageChanged) {
        firstSplitPageChanged = false
        return
      }
      if (this.iframe) await this.load(true)
    })
  }

  splitPageType(): 'none' | 'double' | 'single' {
    if (this.states.splitPage === 'auto') {
      if (this.win) {
        return this.win.innerWidth > 700 ? 'double' : 'single'
      } else {
        return 'single'
      }
    }
    return this.states.splitPage
  }

  updateSplitPageFocusedNode() {
    if (this.splitPageList) {
      const paragraph = this.states.pos.paragraph
      const curSplitPageIndex = findLastIndex(
        this.splitPageList,
        (page) => !!page.top && page.top.paragraph <= paragraph
      )
      if (
        !this.splitPageCurPageIndex ||
        curSplitPageIndex === this.splitPageCurPageIndex
      ) {
        this.splitPageFocusedNode = {
          paragraph,
          readablePart: this.readableParts[paragraph],
        }
      } else if (this.splitPageCurPage?.top) {
        this.splitPageFocusedNode = this.splitPageCurPage?.top
      }
    }
  }

  async tryManipulateDOM(callback: () => any) {
    setTimeout(() => {
      Promise.resolve(callback()).catch(console.error)
    }, 100)
  }

  getReadablePartIndexByAnchorId(anchorId: string): number | null {
    if (!anchorId) return null
    // goto anchorId
    const doc = this.doc
    if (!doc) return null
    try {
      const index = this.readableParts.findIndex((part) => {
        if (part.hashes?.includes(anchorId)) return true
      })
      return index === -1 ? null : index
    } catch {
      // ignore selector syntax error
    }
    return null
  }

  async scrollToCurParagraph(animated = true) {
    // goto paragraph
    const item = this.readableParts[this.states.pos.paragraph]
    if (!item) return
    await this.scrollToElem(item.elem, { animated })
  }

  async scrollToElem(element: HTMLElement, options: ScrollOptions = {}) {
    await this.tryManipulateDOM(async () => {
      if (!this.isSplitPage) {
        element.scrollIntoView({
          behavior: options.animated ?? true ? 'smooth' : 'auto',
          block: options.position ?? 'center',
        })
        return
      }

      if (!this.doc) return
      const body = this.doc.body
      const bodyLeft = body.getBoundingClientRect().left
      const rect = element.getBoundingClientRect()
      const endLeft = rect.left + element.offsetWidth / 2 - bodyLeft
      await this.scrollToPageByLeft(endLeft, options)
    })
  }

  /**
   * scroll to page by left offset with animation
   */
  private async scrollToPageByLeft(
    left: number,
    {
      iteration = 10,
      duration = 20,
      animated = true,
      abortCtrl,
    }: ScrollOptions = {}
  ) {
    const container = this.scrollContainer
    if (!container) return
    if (!this.isSplitPage) return
    if (!this.splitPageList) return

    const finalLeft = findLast(
      this.splitPageList,
      (page) => page.scrollLeft <= left
    )?.scrollLeft
    if (finalLeft === undefined) return

    if (!animated) {
      container.scrollLeft = finalLeft
      return
    }

    let aborted = false
    abortCtrl?.signal.addEventListener('abort', () => {
      aborted = true
    })

    const startLeft = container.scrollLeft
    const offset = finalLeft - startLeft
    const unit = offset / iteration
    const unitTime = duration / iteration
    for (const i of range(0, iteration + 1)) {
      await sleep(unitTime)
      if (aborted) break
      container.scrollLeft = startLeft + i * unit
    }
  }

  #pushSplitPageLast?: {
    abortCtrl: AbortController
    page: number
  }
  async pushSplitPageAdjust(offsetPage: number, jump: boolean) {
    if (!this.splitPageWidth) return
    if (offsetPage === 0) return
    if (this.splitPageCurPageIndex === undefined) return
    if (!this.splitPageCount) return
    if (!this.splitPageList) return

    let goalPage: number
    if (this.#pushSplitPageLast) {
      goalPage = this.#pushSplitPageLast.page + offsetPage
    } else {
      goalPage = this.splitPageCurPageIndex + offsetPage
    }

    // exceed section range
    if (jump) {
      if (goalPage < 0) {
        return await this.player.prevSection(-1)
      } else if (goalPage >= this.splitPageCount) {
        return await this.player.nextSection(0)
      }
    } else {
      if (goalPage < 0) goalPage = 0
      else if (goalPage >= this.splitPageCount)
        goalPage = this.splitPageCount - 1
    }

    this.#pushSplitPageLast?.abortCtrl.abort()
    const abortCtrl = new AbortController()
    this.#pushSplitPageLast = {
      abortCtrl,
      page: goalPage,
    }

    const goalLeft = goalPage * this.splitPageWidth
    if (jump) {
      let paragraph: number | undefined = undefined
      if (offsetPage < 0) {
        paragraph = findLast(
          this.splitPageList,
          (page) => !!page.top && page.scrollLeft <= goalLeft
        )?.top?.paragraph
      } else {
        paragraph = find(
          this.splitPageList,
          (page) => !!page.top && page.scrollLeft >= goalLeft
        )?.top?.paragraph
      }
      if (paragraph !== undefined) await this.player.gotoParagraph(paragraph)
    } else {
      await this.scrollToPageByLeft(goalLeft, { abortCtrl })
    }

    this.updateSplitPageFocusedNode()

    this.#pushSplitPageLast = undefined
  }

  /**
   * @param absPath absolute path
   * @example
   * ```
   * '/OEBPS/Text/index.html'
   * ```
   */
  async loadByPath(absPath: string, force = false) {
    const iframe = this.iframe
    if (!iframe) return

    // skip same path
    if (!force && absPath === this.#curAbsPath) return
    this.#curAbsPath = absPath

    try {
      iframe.style.visibility = 'hidden'
      this.states.loading = true
      const loaded = new Promise<void>((resolve) => {
        iframe.addEventListener(
          'load',
          () => {
            resolve()
          },
          { once: true }
        )
      })
      iframe.src = getBooksRenderPath(
        this.bookType,
        this.book.item.uuid,
        absPath
      )
      await loaded

      const doc = iframe.contentDocument
      if (!doc) return console.error('iframe load failed')

      // load readableParts
      this.readableParts = []
      this.readableParts = getReadableParts(doc, this.flattenedNavs())

      await this.onLoaded(iframe)
      iframe.style.visibility = 'visible'
    } finally {
      this.states.loading = false
    }
  }

  async gotoUrlPathAndScroll(path: string) {
    const [urlMain, anchorId] = urlSplitHash(path)
    const spineIndex = this.book.spines.findIndex((s) => s.href === urlMain)
    if (spineIndex === -1) return
    await this.loadByPath(urlMain)

    const elemIndex = this.getReadablePartIndexByAnchorId(anchorId)
    if (elemIndex == null) {
      this.states.pos = {
        section: spineIndex,
        paragraph: 0,
      }
      await this.scrollToCurParagraph()
      return
    }

    this.states.pos = {
      section: spineIndex,
      paragraph: elemIndex,
    }
    await this.scrollToCurParagraph()
  }

  updateColorTheme(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme
    if (!this.doc) return
    if (colorScheme === 'dark') {
      this.doc.documentElement.classList.add(COLOR_SCHEME_DARK_CLASS)
    } else {
      this.doc.documentElement.classList.remove(COLOR_SCHEME_DARK_CLASS)
    }
  }

  async onLoaded(iframe: HTMLIFrameElement) {
    const win = iframe.contentWindow
    const doc = iframe.contentDocument
    // load inject and hook
    if (win && doc) {
      this.win = win
      this.doc = doc

      setHotkeyIframeWin({ win })

      this.#isVertical = win
        .getComputedStyle(doc.body)
        .writingMode.startsWith('vertical')

      const body = doc.body
      const html = doc.documentElement
      this.scrollContainer =
        body.clientHeight === body.scrollHeight ? html : body
      // eslint-disable-next-line no-console
      console.debug(`scrollContainer: ${this.scrollContainer.tagName}`)

      this.updateColorTheme(this.colorScheme)
      this.injectCSS(doc)
      if (this.isSplitPage) {
        this.splitPageTypeUpdate(doc)
        await this.splitPageCalcuate(win, doc, this.scrollContainer)
        win.addEventListener(
          'resize',
          debounceFn(300, () => {
            async(async () => {
              if (!this.win || !this.scrollContainer) return
              this.splitPageTypeUpdate(doc)
              await this.splitPageCalcuate(win, doc, this.scrollContainer)
              const focusedNode =
                this.splitPageFocusedNode ?? this.splitPageCurPage?.top
              if (focusedNode)
                await this.scrollToElem(focusedNode.readablePart.elem)
              else
                await this.scrollToPageByLeft(this.scrollContainer.scrollLeft)
            })
          })
        )

        this.hookPageTouch()
        this.hookPageWheel()
        this.hookPageScroll()
      } else {
        this.parsePageResizeImgs(doc)
      }
      this.hookALinks(doc)
      this.hookImgs(doc)
      this.hookParagraphClick()
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

    let pageStyle = ''
    if (this.isSplitPage) {
      pageStyle = `
        /* split page */
        html {
          height: 100%;
          width: auto;
          overflow-y: hidden;
          overflow-x: auto;
          columns: auto var(--main-column-count, 1);
          column-gap: 0;
          margin: 0;
          padding: 0;
        }
        body {
          height: 100%;
          width: auto;
          margin: 0;
          padding: 0 10px;
          box-sizing: border-box;
        }
        .${COLUMN_BREAK_CLASS} {
          content: ' ';
          break-before: column;
        }
      `
    }

    styleElem.innerHTML = `
      ${globalStyle}
      ${pageStyle}

      /* wrap */
      pre {
        white-space: pre-wrap;
      }

      /* image */
      svg {
        max-width: 90%!important;
        max-height: 90vh;
      }
      img.${IMG_MAX_WIDTH_CLASS} {
        max-width: 90%!important;
        height: auto;
      }
      img.${IMG_MAX_HEIGHT_CLASS} {
        width: auto;
        max-height: 90vh;
      }

      /* scheme */
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

      /* paragraph */
      .${PARA_BOX_CLASS} {
        cursor: pointer;
      }

      .${PARA_BOX_CLASS}.${PARA_ACTIVE_CLASS} {
        background: var(--main-bg-active);
        outline: 5px solid var(--main-bg-active);
      }

      .${PARA_BOX_CLASS}:hover {
        background: var(--main-bg-hover);
        outline: 5px solid var(--main-bg-hover);
      }

      .${PARA_HIGHLIGHT_CLASS} {
        background-color: var(--main-bg-highlight);
        color: var(--main-fg-highlight) !important;
      }
    `
    doc.head.appendChild(styleElem)

    doc.querySelectorAll('svg').forEach((svg) => {
      svg.setAttribute('preserveAspectRatio', 'xMinYMin meet')
    })
  }

  hookALinks(doc: Document) {
    for (const link of doc.querySelectorAll('a')) {
      if (link.getAttribute('target') === '_blank') {
        link.addEventListener('click', () => {
          window.open(link.href, '_blank', 'noopener,noreferrer')
        })
        continue
      }
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
          await this.gotoUrlPathAndScroll(rootPath)
          this.player.utterer.cancel()
        })
      })
    }
  }

  hookImgs(doc: Document) {
    for (const img of doc.querySelectorAll('img')) {
      img.addEventListener('click', (event) => {
        const src = img.src
        if (!src) return
        event.stopPropagation()
        setPreviewImgSrc(src)
      })
    }

    for (const svg of doc.querySelectorAll('svg')) {
      svg.addEventListener('click', (event) => {
        event.stopPropagation()
        async(async () => {
          const dataURL = await svgToDataUri(svg, doc.URL)
          setPreviewImgSrc(dataURL)
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
  }

  hookPageTouch() {
    const doc = this.doc
    if (!doc) return

    let startX: number | undefined = undefined

    const startlistener = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      startX = touch.clientX
    }

    const movelistener = (event: TouchEvent) => {
      event.preventDefault()
    }

    const endlistener = (event: TouchEvent) => {
      if (startX === undefined) return
      const touch = event.changedTouches[0]
      if (!touch) return
      const deltaX = touch.clientX - startX
      if (deltaX === 0) return
      if (deltaX < 0) {
        void this.player.nextPage(1, false)
      } else {
        void this.player.prevPage(1, false)
      }
    }

    doc.addEventListener('touchstart', startlistener, {
      passive: false,
    })
    doc.addEventListener('touchmove', movelistener, {
      passive: false,
    })
    doc.addEventListener('touchend', endlistener, {
      passive: false,
    })
    this.player.onUnmount(() => {
      doc.documentElement.removeEventListener('touchstart', startlistener)
      doc.documentElement.removeEventListener('touchmove', movelistener)
      doc.documentElement.removeEventListener('touchend', endlistener)
    })
  }

  hookPageWheel() {
    const doc = this.doc
    if (!doc) return

    const listener = (e: WheelEvent) => {
      e.preventDefault()
      if (isInputElement(e.target)) return
      if (e.deltaY === 0) return
      if (e.deltaY > 0) {
        void this.player.nextPage(1, false)
      } else {
        void this.player.prevPage(1, false)
      }
    }

    doc.documentElement.addEventListener('wheel', listener, {
      passive: false,
    })
    this.player.onUnmount(() => {
      doc.documentElement.removeEventListener('wheel', listener)
    })
  }

  hookPageScroll() {
    const win = this.win
    const scrollContainer = this.scrollContainer
    if (!win || !scrollContainer) return
    const doc = this.doc
    if (!doc) return

    const listener = () => {
      if (!this.splitPageWidth) return 0

      this.splitPageCurPageIndex = Math.round(
        scrollContainer.scrollLeft / this.splitPageWidth
      )
      this.splitPageCurPage = this.splitPageList?.[this.splitPageCurPageIndex]
    }
    listener()

    win.addEventListener('scroll', listener)
    this.player.onUnmount(() => {
      win.removeEventListener('scroll', listener)
    })
  }

  splitPageTypeUpdate(doc: Document) {
    // column count
    const columnCount = this.splitPageType() === 'single' ? 1 : 2
    const html = doc.documentElement
    html.style.setProperty('--main-column-count', columnCount.toString())
  }

  async splitPageCalcuate(
    win: Window,
    doc: Document,
    scrollContainer: HTMLElement
  ) {
    // Make sure the width is loaded correctly
    scrollContainer.offsetWidth

    let scrollWidth = scrollContainer.scrollWidth
    const width = win.innerWidth
    let count: number

    // fix column double last page
    doc.querySelector(`.${COLUMN_BREAK_CLASS}`)?.remove()
    if (this.splitPageType() === 'double') {
      count = Math.round((2 * scrollWidth) / width)
      if (count % 2 === 1) {
        // add empty page & refresh the scrollWidth
        count += 1
        const p = doc.createElement('p')
        p.classList.add(COLUMN_BREAK_CLASS)
        doc.body.appendChild(p)
        scrollWidth = scrollContainer.scrollWidth
      }
      count /= 2
    } else {
      count = Math.round(scrollContainer.scrollWidth / width)
    }

    this.splitPageWidth = width
    this.splitPageCount = count
    // eslint-disable-next-line no-console
    console.debug(`scrollWidth: ${scrollWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`splitPageWidth: ${this.splitPageWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`splitPageCount: ${this.splitPageCount}`)

    this.parsePageResizeImgs(doc)
    this.parseSplitPageTopReadableParts(scrollContainer)
  }

  private parsePageResizeImgs(doc: Document) {
    const img_classes = [IMG_MAX_WIDTH_CLASS, IMG_MAX_HEIGHT_CLASS]
    const imgs = doc.querySelectorAll('img')
    for (const img of imgs) {
      img.classList.remove(...img_classes)
    }
    if (!this.splitPageWidth) return

    if (this.splitPageType() === 'none') {
      const width = this.splitPageWidth
      for (const img of imgs) {
        if (img.width > width) img.classList.add(IMG_MAX_WIDTH_CLASS)
      }
    } else {
      if (!this.win) return
      const width =
        this.splitPageWidth / (this.splitPageType() === 'double' ? 2 : 1)
      const height = this.win.innerHeight
      const pageWHRate = width / height
      for (const img of imgs) {
        if (img.width > width || img.height > height)
          img.classList.add(
            img.naturalWidth / img.naturalHeight > pageWHRate
              ? IMG_MAX_WIDTH_CLASS
              : IMG_MAX_HEIGHT_CLASS
          )
      }
    }
  }

  private parseSplitPageTopReadableParts(scrollContainer: HTMLElement) {
    const width = this.splitPageWidth
    if (!width) return
    if (!this.splitPageCount) return

    this.splitPageList = range(0, this.splitPageCount)
      .map((i) => i * width)
      .map((scrollLeft) => ({ scrollLeft }))

    const parentLeft = scrollContainer.getBoundingClientRect().left
    for (const [paragraph, readablePart] of this.readableParts.entries()) {
      const rect = readablePart.elem.getBoundingClientRect()
      const scrollLeft =
        rect.left + readablePart.elem.offsetWidth / 2 - parentLeft
      const page = findLast(
        this.splitPageList,
        (page) => page.scrollLeft <= scrollLeft
      )
      if (page && !page.top)
        page.top = {
          readablePart,
          paragraph,
        }
    }
  }

  async load(force = false) {
    const spine = this.book.spines[this.states.pos.section]
    if (spine) {
      await this.loadByPath(spine.href, force)
      await this.scrollToCurParagraph(false)
    } else {
      const spine = this.book.spines[0]
      await this.loadByPath(spine.href, force)
      this.states.pos = {
        section: 0,
        paragraph: 0,
      }
      await this.scrollToCurParagraph(false)
    }
    this.paragraphActive()
    this.updateFocusedNavs()
    this.updateSplitPageFocusedNode()
  }

  #paragraphLastActive?: ReadablePart
  paragraphActive() {
    this.tryManipulateDOM(() => {
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
    }).catch(console.error)
  }

  #flattenedNavs?: BookNav[]

  flattenedNavs() {
    if (!this.#flattenedNavs) {
      this.#flattenedNavs = []
      const stack = [...this.book.navs].reverse()
      while (stack.length) {
        const cur = stack.pop()!
        this.#flattenedNavs.push(cur)
        stack.push(...cur.children)
      }
    }
    return this.#flattenedNavs
  }

  updateFocusedNavs() {
    interface RequiredNav extends BookNav {
      spineIndex: number
    }

    // same spineIndex navs
    const navs = this.flattenedNavs().filter(
      (nav): nav is RequiredNav => nav.spineIndex === this.states.pos.section
    )
    if (navs.length === 0) {
      const lastNav = findLast(
        this.flattenedNavs(),
        (nav) => !!nav.spineIndex && nav.spineIndex < this.states.pos.section
      )
      this.states.focusedNavs = lastNav ? [lastNav] : []
      return
    }

    const readableParts = this.readableParts
    // last hash from iframe page
    const lastHashes = findLast(
      readableParts.slice(0, this.states.pos.paragraph + 1),
      (part) => !!part.hashes
    )?.hashes
    const lastHash =
      lastHashes && lastHashes.length > 0
        ? lastHashes[lastHashes.length - 1]
        : null
    if (!lastHash) {
      this.states.focusedNavs = [navs[0]]
      return
    }

    // find nav and index is equal last hash
    const [matchedNav, matchedNavIndex] = findPair(
      navs,
      (nav) => nav.hrefHash === lastHash
    )
    if (!matchedNav) {
      this.states.focusedNavs = [navs[0]]
      return
    }

    // find all parent navs
    const matchedNavs: BookNav[] = [matchedNav]
    let index = matchedNavIndex - 1
    let level = matchedNav.level - 1
    while (index >= 0 && level > 0) {
      const [nav, newIndex] = findLastPair(
        navs,
        (nav) => nav.level === level,
        index
      )
      if (nav) {
        index = newIndex - 1
        level = nav.level - 1
        matchedNavs.unshift(nav)
      } else {
        break
      }
    }
    this.states.focusedNavs = matchedNavs
  }
}

export function usePlayerIframe(player: Player) {
  useMountEffect(async () => {
    await player.iframeCtrler.load()
  })
}
