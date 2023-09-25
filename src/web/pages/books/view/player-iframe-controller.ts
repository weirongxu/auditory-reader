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
  PARA_BOOKMARK_CLASS,
  PARA_BOX_CLASS,
  PARA_HIGHLIGHT_CLASS,
} from '../../../../core/consts.js'
import {
  find,
  findLast,
  findLastIndex,
  findLastPair,
  range,
} from '../../../../core/util/collection.js'
import { isInputElement, svgToDataUri } from '../../../../core/util/dom.js'
import { async, sleep } from '../../../../core/util/promise.js'
import { debounceFn } from '../../../../core/util/timer.js'
import { urlSplitAnchor } from '../../../../core/util/url.js'
import { previewImgSrcAtom } from '../../../common/preview-image.js'
import { pushSnackbar } from '../../../common/snackbar.js'
import { hotkeyIframeWinAtom } from '../../../hotkey/hotkey-state.js'
import { globalStore } from '../../../store/global.js'
import { globalStyle } from '../../../style.js'
import type { Player } from './player'
import type { PlayerStatesManager } from './player-states.js'
import type { ReadablePart, TextAlias } from './types.js'
import { ReadableExtractor } from './utils/readable.js'

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
  #debugLoading = false

  readableParts: ReadablePart[] = []
  alias: TextAlias[] = []
  protected mainContentRootPath: string
  protected mainContentRootUrl: string
  protected colorScheme: ColorScheme = 'light'
  protected splitPageCount?: number
  protected splitPageWidth?: number
  protected splitPageList?: SplitPageNode[]
  protected splitPageCurScrollIndex?: number
  protected splitPageCurScrollNode?: SplitPageNode
  protected splitPageResizeToNode?: {
    paragraph: number
    readablePart: ReadablePart
  }
  protected win?: Window
  public doc?: Document
  public scrollContainer?: HTMLElement
  #isVertical = false

  get book() {
    return this.player.book
  }

  get iframe() {
    return this.iframeRef.current
  }

  get isSplitPage() {
    if (this.states.splitPage === 'none') return false
    return !this.#isVertical
  }

  get isFirstSplitPage() {
    return this.splitPageCurScrollIndex === 0
  }

  get isLastSplitPage() {
    if (this.splitPageCurScrollIndex === undefined || !this.splitPageCount)
      return true
    return this.splitPageCurScrollIndex >= this.splitPageCount - 1
  }

  constructor(
    protected player: Player,
    protected states: PlayerStatesManager,
    protected iframeRef: RefObject<HTMLIFrameElement>
  ) {
    this.mainContentRootPath = getBooksRenderPath(this.book.item.uuid, '')

    this.mainContentRootUrl = new URL(
      this.mainContentRootPath,
      location.href
    ).toString()

    this.states.events.on('pos', () => {
      this.updateParagraphActive()
      this.updateActiveNavs()
      this.updateSplitPageResizeToNode()
    })

    this.states.uiEvents.on('bookmarks', () => {
      this.updateBookmarks()
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

  protected splitPageType(): 'none' | 'double' | 'single' {
    if (this.states.splitPage === 'auto') {
      if (this.win) {
        return this.win.innerWidth > 700 ? 'double' : 'single'
      } else {
        return 'single'
      }
    }
    return this.states.splitPage
  }

  protected updateSplitPageResizeToNode(first = false) {
    if (this.splitPageList) {
      const paragraph = this.states.pos.paragraph
      const curSplitPageIndex = findLastIndex(
        this.splitPageList,
        (page) => !!page.top && page.top.paragraph <= paragraph
      )
      if (
        this.splitPageCurScrollIndex === undefined ||
        first ||
        curSplitPageIndex === this.splitPageCurScrollIndex
      ) {
        // use the pos paragraph as resize to node
        this.splitPageResizeToNode = {
          paragraph,
          readablePart: this.readableParts[paragraph],
        }
      } else if (this.splitPageCurScrollNode?.top) {
        // use the current scroll offset as resize to node
        this.splitPageResizeToNode = this.splitPageCurScrollNode?.top
      }
    }
  }

  public async tryManipulateDOM(callback: () => any) {
    setTimeout(() => {
      Promise.resolve(callback()).catch(console.error)
    }, 100)
  }

  protected getReadablePartIndexByAnchorId(anchorId: string): number | null {
    if (!anchorId) return null
    // goto anchorId
    const doc = this.doc
    if (!doc) return null
    try {
      const index = this.readableParts.findIndex((part) => {
        if (part.anchorIds?.includes(anchorId)) return true
      })
      return index === -1 ? null : index
    } catch {
      // ignore selector syntax error
    }
    return null
  }

  public async scrollToCurParagraph(animated = true) {
    // goto paragraph
    const item = this.readableParts[this.states.pos.paragraph]
    if (!item) return
    await this.scrollToElem(item.elem, { animated })
  }

  public async scrollToElem(element: HTMLElement, options: ScrollOptions = {}) {
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
  public async scrollToPageByLeft(
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
  public async pushSplitPageAdjust(offsetPage: number, jump: boolean) {
    if (!this.splitPageWidth) return
    if (offsetPage === 0) return
    if (this.splitPageCurScrollIndex === undefined) return
    if (!this.splitPageCount) return
    if (!this.splitPageList) return

    let goalPage: number
    if (this.#pushSplitPageLast) {
      goalPage = this.#pushSplitPageLast.page + offsetPage
    } else {
      goalPage = this.splitPageCurScrollIndex + offsetPage
    }

    // exceed section range
    if (jump) {
      if (goalPage < 0) {
        return await this.player.prevSection(-1)
      } else if (goalPage >= this.splitPageCount) {
        return await this.player.nextSection()
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
      if (paragraph === undefined || paragraph === this.states.pos.paragraph)
        // paragraph is undefined
        //   offsetPage < 0
        //     - Scroll when first page no top paragraph but have the empty content
        //   offsetPage > 0
        //     - Scroll when last page no top paragraph but have the residue content
        //     - It will happen when the last paragraph is too long
        // paragraph is current.paragraph
        //   - Scroll
        await this.scrollToPageByLeft(goalLeft, { abortCtrl })
      else await this.player.gotoParagraph(paragraph)
    } else {
      await this.scrollToPageByLeft(goalLeft, { abortCtrl })
    }

    this.updateSplitPageResizeToNode()

    this.#pushSplitPageLast = undefined
  }

  #curAbsPath?: string

  /**
   * @param locate default is this.states.pos
   */
  public async loadByPos(
    locate: {
      section?: number
      anchorId?: string
      paragraph?: number
      /** @default false */
      animated?: boolean
    },
    force = false
  ) {
    const iframe = this.iframe
    if (!iframe) return

    const section = locate.section ?? this.states.pos.section
    let spine = this.book.spines[section]
    if (!spine) spine = this.book.spines[0]
    if (!spine)
      return pushSnackbar({
        message: 'book spine is empty',
        severity: 'error',
      })

    const absPath = spine.href

    const isLoadNewPath = force || absPath !== this.#curAbsPath
    this.#curAbsPath = absPath

    try {
      // load iframe
      if (isLoadNewPath) {
        if (!this.#debugLoading) iframe.style.visibility = 'hidden'
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
        iframe.src = getBooksRenderPath(this.book.item.uuid, absPath)
        await loaded

        const doc = iframe.contentDocument
        if (!doc)
          return pushSnackbar({
            message: 'iframe load failed',
            severity: 'error',
          })

        // load readableParts & alias
        const readableExtractor = new ReadableExtractor(
          doc,
          this.book.flattenedNavs
        )
        this.readableParts = readableExtractor.toReadableParts()
        this.alias = readableExtractor.alias()
      }

      // goto pos
      let paragraph = this.states.pos.paragraph
      if (locate?.paragraph !== undefined) {
        paragraph =
          locate.paragraph < 0
            ? this.readableParts.length + locate.paragraph
            : locate.paragraph
        // if exceeds readablePart range
        if (paragraph < 0) paragraph = 0
        else if (paragraph >= this.readableParts.length)
          paragraph = this.readableParts.length - 1
      } else if (locate?.anchorId)
        paragraph = this.getReadablePartIndexByAnchorId(locate.anchorId) ?? 0

      this.states.pos = {
        section,
        paragraph,
      }
      await this.scrollToCurParagraph(locate.animated ?? false)

      // loaded
      if (isLoadNewPath) {
        await this.onLoaded(iframe)
        if (!this.#debugLoading) iframe.style.visibility = 'visible'
      }
    } finally {
      this.states.loading = false
    }
  }

  public async gotoUrlPath(path: string) {
    const [urlMain, anchorId] = urlSplitAnchor(path)
    const section = this.book.spines.findIndex((s) => s.href === urlMain)
    if (section === -1) return
    await this.loadByPos({ section, anchorId })
  }

  public updateColorTheme(colorScheme: ColorScheme) {
    this.colorScheme = colorScheme
    if (!this.doc) return
    if (colorScheme === 'dark') {
      this.doc.documentElement.classList.add(COLOR_SCHEME_DARK_CLASS)
    } else {
      this.doc.documentElement.classList.remove(COLOR_SCHEME_DARK_CLASS)
    }
  }

  /**
   * When loaded a new page
   */
  protected async onLoaded(iframe: HTMLIFrameElement) {
    const win = iframe.contentWindow
    const doc = iframe.contentDocument
    // load inject and hook
    if (win && doc) {
      this.win = win
      this.doc = doc

      globalStore.set(hotkeyIframeWinAtom, { win })

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
        await this.splitPageCalcuate(win, doc, this.scrollContainer)
        win.addEventListener(
          'resize',
          debounceFn(300, () => {
            async(async () => {
              if (!this.win || !this.scrollContainer) return
              await this.splitPageCalcuate(win, doc, this.scrollContainer)
              const resizeToNode =
                this.splitPageResizeToNode ?? this.splitPageCurScrollNode?.top
              if (resizeToNode)
                await this.scrollToElem(resizeToNode.readablePart.elem, {
                  animated: false,
                })
              else
                await this.scrollToPageByLeft(this.scrollContainer.scrollLeft, {
                  animated: false,
                })
              this.player.utterer.hl.reCreateRoot(doc)
            })
          })
        )

        this.hookPageTouch()
        this.hookPageWheel()
        this.hookPageScroll()
      }
      this.parsePageResizeImgs(doc)
      this.hookALinks(doc)
      this.hookImgs(doc)
      this.hookParagraphClick()
      this.player.utterer.hl.reCreateRoot(doc)
    }
  }

  protected injectCSS(doc: Document) {
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
          columns: var(--main-column-count, 1) auto;
          /* columns: auto var(--main-column-width); */
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
        .map((s) => `.${COLOR_SCHEME_DARK_CLASS} ${s}`)
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

      .${PARA_HIGHLIGHT_CLASS} > div {
        background-color: var(--main-bg-highlight);
        color: var(--main-fg-highlight) !important;
        position: fixed;
        user-select: none;
      }

      .${PARA_BOOKMARK_CLASS} {
        text-decoration: 1px dashed underline;
        text-underline-offset: 4px;
      }
    `
    doc.head.appendChild(styleElem)

    doc.querySelectorAll('svg').forEach((svg) => {
      svg.setAttribute('preserveAspectRatio', 'xMinYMin meet')
    })
  }

  protected hookALinks(doc: Document) {
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
          await this.gotoUrlPath(rootPath)
          this.player.utterer.cancel()
        })
      })
    }
  }

  protected hookImgs(doc: Document) {
    for (const img of doc.querySelectorAll('img')) {
      img.addEventListener('click', (event) => {
        const src = img.src
        if (!src) return
        event.stopPropagation()
        globalStore.set(previewImgSrcAtom, src)
      })
    }

    for (const svg of doc.querySelectorAll('svg')) {
      svg.addEventListener('click', (event) => {
        event.stopPropagation()
        async(async () => {
          const dataURL = await svgToDataUri(svg, doc.URL)
          globalStore.set(previewImgSrcAtom, dataURL)
        })
      })
    }
  }

  protected hookParagraphClick() {
    const click = (paraIndex: number) => {
      this.player.gotoParagraph(paraIndex).catch(console.error)
    }
    this.readableParts.forEach((n, i) => {
      if (n.type === 'text') n.elem.addEventListener('click', () => click(i))
    })
  }

  protected hookPageTouch() {
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

  protected hookPageWheel() {
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

  protected hookPageScroll() {
    const win = this.win
    const scrollContainer = this.scrollContainer
    if (!win || !scrollContainer) return
    const doc = this.doc
    if (!doc) return

    const listener = () => {
      if (!this.splitPageWidth) return

      this.splitPageCurScrollIndex = Math.round(
        scrollContainer.scrollLeft / this.splitPageWidth
      )
      this.splitPageCurScrollNode =
        this.splitPageList?.[this.splitPageCurScrollIndex]
    }
    listener()

    win.addEventListener('scroll', listener)
    this.player.onUnmount(() => {
      win.removeEventListener('scroll', listener)
    })
  }

  protected async splitPageCalcuate(
    win: Window,
    doc: Document,
    scrollContainer: HTMLElement
  ) {
    // Make sure the width is loaded correctly
    // scrollContainer.offsetWidth

    const html = doc.documentElement
    const splitPageType = this.splitPageType()
    const width = win.innerWidth

    // update column count
    const columnCount = splitPageType === 'single' ? 1 : 2
    const columnWidth = width / columnCount
    html.style.setProperty('--main-column-count', columnCount.toString())
    html.style.setProperty('--main-column-width', `${columnWidth}px`)

    let scrollWidth = scrollContainer.scrollWidth
    let pageCount: number

    // update split page width
    doc.querySelector(`.${COLUMN_BREAK_CLASS}`)?.remove()
    if (splitPageType === 'double') {
      // fix column double last page
      pageCount = Math.round((2 * scrollWidth) / width)
      if (pageCount % 2 === 1) {
        // add empty page & update the scrollWidth
        pageCount += 1
        const p = doc.createElement('p')
        p.classList.add(COLUMN_BREAK_CLASS)
        doc.body.appendChild(p)
        scrollWidth = scrollContainer.scrollWidth
      }
      pageCount /= 2
    } else {
      pageCount = Math.round(scrollWidth / width)
    }

    this.splitPageWidth = width
    this.splitPageCount = pageCount
    // eslint-disable-next-line no-console
    console.debug(`scrollWidth: ${scrollWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`splitPageWidth: ${this.splitPageWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`splitPageCount: ${this.splitPageCount}`)

    this.parseSplitPageTopReadableParts(scrollContainer)
  }

  protected parsePageResizeImgs(doc: Document) {
    const imgClasses = [IMG_MAX_WIDTH_CLASS, IMG_MAX_HEIGHT_CLASS]
    const imgs = doc.querySelectorAll('img')
    for (const img of imgs) {
      img.classList.remove(...imgClasses)
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

  protected parseSplitPageTopReadableParts(scrollContainer: HTMLElement) {
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

  public async load(force = false) {
    await this.loadByPos({}, force)
    this.updateParagraphActive()
    this.updateActiveNavs()
    this.updateSplitPageResizeToNode(true)
    this.updateBookmarks()
  }

  #paragraphLastActive?: ReadablePart
  protected updateParagraphActive() {
    this.tryManipulateDOM(() => {
      const item = this.readableParts[this.states.pos.paragraph]
      if (
        !item ||
        (this.#paragraphLastActive && item === this.#paragraphLastActive)
      )
        return
      this.#paragraphLastActive?.elem.classList.remove(PARA_ACTIVE_CLASS)
      this.#paragraphLastActive = item
      item.elem.classList.add(PARA_ACTIVE_CLASS)
    }).catch(console.error)
  }

  protected updateBookmarks() {
    this.tryManipulateDOM(() => {
      if (!this.states.bookmarks) return
      for (const bookmark of this.states.bookmarks) {
        if (bookmark.section !== this.states.pos.section) continue
        const item = this.readableParts[bookmark.paragraph]
        if (!item) continue
        item.elem.classList.add(PARA_BOOKMARK_CLASS)
      }
    }).catch(console.error)
  }

  protected updateActiveNavs() {
    interface RequiredNav extends BookNav {
      spineIndex: number
    }

    // same spineIndex navs
    const navs = this.book.flattenedNavs.filter(
      (nav): nav is RequiredNav => nav.spineIndex === this.states.pos.section
    )

    const findNav = (): BookNav | undefined => {
      // get last nav of less than spineIndex
      if (navs.length === 0) {
        const lastNav = findLast(
          this.book.flattenedNavs,
          (nav) => !!nav.spineIndex && nav.spineIndex < this.states.pos.section
        )
        return lastNav
      }

      // last anchor from iframe page
      const readableParts = this.readableParts
      const lastAnchors = findLast(
        readableParts.slice(0, this.states.pos.paragraph + 1),
        (part) => !!part.navAnchorIds
      )?.navAnchorIds
      const lastAnchor =
        lastAnchors && lastAnchors.length > 0
          ? lastAnchors[lastAnchors.length - 1]
          : null

      // no anchor in iframe
      if (!lastAnchor) {
        return navs[0]
      }

      // find last matched anchor nav
      const matchedNav = findLast(navs, (nav) => nav.hrefAnchor === lastAnchor)

      // no matched nav by last anchor
      if (!matchedNav) {
        return navs[0]
      }

      return matchedNav
    }

    const matchedNav = findNav()
    if (!matchedNav) {
      this.states.activeNavs = []
      return
    }
    const matchedNavIndex = this.book.flattenedNavs.indexOf(matchedNav)
    if (matchedNavIndex === -1) {
      this.states.activeNavs = []
      return
    }

    // find all parent navs
    const matchedNavs: BookNav[] = [matchedNav]
    let index = matchedNavIndex - 1
    let level = matchedNav.level - 1
    while (index >= 0 && level > 0) {
      const [nav, newIndex] = findLastPair(
        this.book.flattenedNavs,
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
    this.states.activeNavs = matchedNavs
  }
}

export function usePlayerIframe(player: Player) {
  useMountEffect(async () => {
    // first load page
    await player.iframeCtrler.load()
  })
}
