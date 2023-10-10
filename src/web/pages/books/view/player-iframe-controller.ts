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
import {
  debounceFn,
  iterateAnimate,
  type IterateAnimateOptions,
} from '../../../../core/util/timer.js'
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
import { isMobile, isSafari } from '../../../../core/util/browser.js'

type ColorScheme = 'light' | 'dark'

type PageListNode = {
  topmost?: {
    paragraph: number
    readablePart: ReadablePart
  }
  scrollLeft: number
}

interface ScrollOptions extends IterateAnimateOptions {
  /**
   * @default true
   */
  animated?: boolean
  /**
   * @default 'center'
   */
  position?: 'center' | 'nearest'
  /**
   * @default true
   */
  userOperator?: boolean
}

export class PlayerIframeController {
  readableParts: ReadablePart[] = []
  alias: TextAlias[] = []
  protected mainContentRootPath: string
  protected mainContentRootUrl: string
  protected colorScheme: ColorScheme = 'light'
  protected viewWidth?: number
  protected viewHeight?: number
  protected pageList?: PageListNode[]
  /** page list: single page width */
  protected pageListColumnWidth?: number
  /** page list: focus to part after resize */
  protected pageListResizeFocusPart?: ReadablePart
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

  get enabledPageList() {
    if (this.states.pageList === 'none') return false
    return !this.#isVertical
  }

  get isFirstPageList() {
    return this.states.pageListCurIndex === 0
  }

  get isLastPageList() {
    if (
      this.states.pageListCurIndex === undefined ||
      !this.states.pageListCount
    )
      return true
    return this.states.pageListCurIndex >= this.states.pageListCount - 1
  }

  constructor(
    protected player: Player,
    protected states: PlayerStatesManager,
    protected iframeRef: RefObject<HTMLIFrameElement>,
  ) {
    this.mainContentRootPath = getBooksRenderPath(this.book.item.uuid, '')

    this.mainContentRootUrl = new URL(
      this.mainContentRootPath,
      location.href,
    ).toString()

    this.states.events.on('pos', () => {
      this.updateParagraphActive()
      this.updateActiveNavs()
    })

    this.states.events.on('started', (started) => {
      if (!started) {
        this.player.utterer.hl.highlightHide()
      }
    })

    this.states.uiEvents.on('bookmarks', () => {
      this.updateBookmarks()
    })

    let firstPageListChanged = true
    this.states.uiEvents.on('pageList', async () => {
      if (firstPageListChanged) {
        firstPageListChanged = false
        return
      }
      if (this.iframe) await this.load({ force: true })
    })

    this.player.onUnmount(() => this.triggerUnmount())
  }

  #onUnmountCallbacks: (() => void)[] = []
  onUnmount(callback: () => void) {
    this.#onUnmountCallbacks.push(callback)
  }

  triggerUnmount() {
    for (const callback of this.#onUnmountCallbacks) {
      callback()
    }
    this.#onUnmountCallbacks = []
  }

  protected pageListType(): 'none' | 'double' | 'single' {
    if (this.states.pageList === 'auto') {
      if (this.win) {
        return this.win.innerWidth > 700 ? 'double' : 'single'
      } else {
        return 'single'
      }
    }
    return this.states.pageList
  }

  public async tryManipulateDOM(callback: () => unknown) {
    await Promise.race([callback(), sleep(100)])
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
    const item = this.readableParts.at(this.states.pos.paragraph)
    if (!item) return
    await this.scrollToElem(item.elem, { animated })
  }

  public async scrollToElem(element: HTMLElement, options: ScrollOptions = {}) {
    await this.tryManipulateDOM(async () => {
      if (!this.doc) return
      const body = this.doc.body
      const bodyRect = body.getBoundingClientRect()
      const elemRect = element.getBoundingClientRect()
      if (!this.enabledPageList) {
        const bodyTop = bodyRect.top
        const endTop = elemRect.top - bodyTop
        await this.scrollToTop(endTop, options)
      } else {
        const bodyLeft = bodyRect.left
        const endLeft = elemRect.left + element.offsetWidth / 2 - bodyLeft
        await this.scrollToPageByLeft(endLeft, options)
      }
    })
  }

  /**
   * scroll to top offset with animation
   */
  public async scrollToTop(
    top: number,
    {
      iteration = 10,
      duration = 100,
      animated = true,
      abortCtrl,
      position = 'center',
    }: ScrollOptions = {},
  ) {
    if (!this.win) return
    const container = this.scrollContainer
    if (!container) return

    // get center top
    const finalTop =
      position === 'center' ? Math.max(0, top - this.win?.innerHeight / 2) : top

    if (!animated) {
      container.scrollTop = finalTop
    } else {
      const startTop = container.scrollTop
      const offset = finalTop - startTop
      const unit = offset / iteration
      await iterateAnimate(
        {
          duration,
          iteration,
          abortCtrl,
        },
        (index) => {
          container.scrollTop = startTop + index * unit
        },
      )
    }
  }

  /**
   * scroll to page by left offset with animation
   */
  public async scrollToPageByLeft(
    left: number,
    {
      iteration = 10,
      duration = 100,
      animated = true,
      abortCtrl,
      userOperator = true,
    }: ScrollOptions = {},
  ) {
    const container = this.scrollContainer
    if (!container) return
    if (!this.enabledPageList) return
    if (!this.pageList) return

    const finalLeft = findLast(this.pageList, (page) => page.scrollLeft <= left)
      ?.scrollLeft
    if (finalLeft === undefined) return

    if (!animated) {
      container.scrollLeft = finalLeft
    } else {
      const startLeft = container.scrollLeft
      const offset = finalLeft - startLeft
      const unit = offset / iteration
      await iterateAnimate(
        {
          duration,
          iteration,
          abortCtrl,
        },
        (index) => {
          container.scrollLeft = startLeft + index * unit
        },
      )
    }

    if (this.viewWidth)
      this.states.pageListCurIndex = Math.round(
        container.scrollLeft / this.viewWidth,
      )
    if (userOperator) this.updatePageListFocus()
  }

  #pushPageListLast?: {
    abortCtrl: AbortController
    pageIndex: number
  }
  public async pushPageListAdjust(offsetPage: number, jump: boolean) {
    if (!this.viewWidth) return
    if (this.states.pageListCurIndex === undefined) return
    if (!this.states.pageListCount) return
    if (!this.pageList) return

    let goalPageIndex: number
    if (this.#pushPageListLast) {
      goalPageIndex = this.#pushPageListLast.pageIndex + offsetPage
    } else {
      goalPageIndex = this.states.pageListCurIndex + offsetPage
    }

    // exceed section range
    if (jump) {
      if (goalPageIndex < 0) {
        return await this.player.prevSection(-1)
      } else if (goalPageIndex >= this.states.pageListCount) {
        return await this.player.nextSection()
      }
    } else {
      if (goalPageIndex < 0) goalPageIndex = 0
      else if (goalPageIndex >= this.states.pageListCount)
        goalPageIndex = this.states.pageListCount - 1
    }

    this.#pushPageListLast?.abortCtrl.abort()
    const abortCtrl = new AbortController()
    this.#pushPageListLast = {
      abortCtrl,
      pageIndex: goalPageIndex,
    }

    const goalLeft = goalPageIndex * this.viewWidth
    if (jump) {
      let paragraph: number | undefined = undefined
      if (offsetPage < 0) {
        paragraph = findLast(
          this.pageList,
          (page) => !!page.topmost && page.scrollLeft <= goalLeft,
        )?.topmost?.paragraph
      } else {
        paragraph = find(
          this.pageList,
          (page) => !!page.topmost && page.scrollLeft >= goalLeft,
        )?.topmost?.paragraph
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

    this.#pushPageListLast = undefined
  }

  #curAbsPath?: string

  /**
   * @param locate default is this.states.pos
   */
  public async load(
    locate: {
      section?: number
      anchorId?: string
      paragraph?: number
      /** @default false */
      animated?: boolean
      /** @default false */
      force?: boolean
    } = {},
  ) {
    const iframe = this.iframe
    if (!iframe) return
    const force = locate.force ?? false

    // get spine
    const section = locate.section ?? this.states.pos.section
    let spine = this.book.spines[section]
    if (!spine) spine = this.book.spines[0]
    if (!spine)
      return pushSnackbar({
        message: 'book spine is empty',
        severity: 'error',
      })
    // update section
    this.states.pos = { ...this.states.pos, section }

    const absPath = spine.href

    const isLoadNewPath = force || absPath !== this.#curAbsPath
    this.#curAbsPath = absPath

    try {
      // load iframe
      if (isLoadNewPath) {
        this.states.loading = true
        this.iframe.style.opacity = '0'
        this.triggerUnmount()

        const loaded = new Promise<void>((resolve) => {
          iframe.addEventListener(
            'load',
            () => {
              resolve()
            },
            { once: true },
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
          this.book.flattenedNavs,
        )
        this.readableParts = readableExtractor.toReadableParts()
        this.alias = readableExtractor.alias()

        // loaded
        await this.onLoaded(iframe)
      }

      // update paragraph
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
        ...this.states.pos,
        paragraph,
      }

      // scroll to paragraph
      await this.scrollToCurParagraph(locate.animated ?? false)
    } finally {
      if (isLoadNewPath) {
        this.states.loading = false
        this.iframe.style.opacity = '1'
      }
    }
  }

  public async gotoUrlPath(path: string) {
    const [urlMain, anchorId] = urlSplitAnchor(path)
    const section = this.book.spines.findIndex((s) => s.href === urlMain)
    if (section === -1) return
    await this.load({ section, anchorId })
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

      this.scrollContainer = this.detectScrollContainer(doc)

      this.updateColorTheme(this.colorScheme)
      this.injectCSS(doc)
      this.viewCalculate(doc)
      win.addEventListener('resize', () => {
        if (this.states.loading) return
        this.onResize(doc)
      })
      this.resizeImgs(doc)
      if (this.enabledPageList) {
        await this.pageListCalculate(doc)
        this.hookPageTouch()
        this.hookPageWheel()
      }
      this.hookALinks(doc)
      this.hookImgs(doc)
      this.hookParagraphClick()
      this.player.utterer.hl.reCreateRoot(doc)
      this.updateBookmarks()
    }
  }

  protected onResize = debounceFn(300, (doc: Document) => {
    async(async () => {
      this.viewCalculate(doc)
      this.resizeImgs(doc)
      if (this.enabledPageList) {
        if (!this.scrollContainer) return
        await this.pageListCalculate(doc)
        const resizeFocusPart = this.pageListResizeFocusPart
        if (resizeFocusPart)
          await this.scrollToElem(resizeFocusPart.elem, {
            animated: false,
            userOperator: false,
          })
        else
          await this.scrollToPageByLeft(this.scrollContainer.scrollLeft, {
            animated: false,
            userOperator: false,
          })
        this.player.utterer.hl.highlightHide()
      }
    })
  })

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
    if (this.enabledPageList) {
      pageStyle = `
        /* page list */
        html {
          height: 100%;
          width: auto;
          overflow: hidden;
          /* Safari iOS not support
            columns: var(--main-column-count) auto;
          */
          columns: var(--main-column-count) var(--main-column-width);
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
    let hoverStyle = ''
    if (!isMobile) {
      hoverStyle = `
        .${PARA_BOX_CLASS}:hover {
          outline: 1px dashed var(--main-fg-hover);
        }
      `
    }

    styleElem.innerHTML = `
      ${globalStyle}
      ${pageStyle}

      /* scrollbar */
      ::-webkit-scrollbar-thumb {
        background: var(--main-fg);
      }

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

      ${hoverStyle}

      .${PARA_HIGHLIGHT_CLASS} > div {
        background-color: var(--main-bg-highlight) !important;
        color: var(--main-fg-highlight) !important;
        position: fixed;
        user-select: none;
      }

      .${PARA_BOOKMARK_CLASS} {
        text-decoration-line: underline;
        text-decoration-style: dashed;
        text-decoration-thickness: 1px;
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
    const win = this.win
    if (!win) return
    const click = (paraIndex: number) => {
      this.player.gotoParagraph(paraIndex).catch(console.error)
    }
    const dblclick = (paraIndex: number) => {
      this.player.bookmarks
        .toggleBookmark({
          section: this.states.pos.section,
          paragraph: paraIndex,
        })
        .catch(console.error)
    }
    this.readableParts.forEach((n, i) => {
      if (n.type === 'text') {
        n.elem.addEventListener('click', () => click(i))
        n.elem.addEventListener('dblclick', (e) => {
          e.preventDefault()
          win.getSelection()?.removeAllRanges()
          dblclick(i)
        })
        let lastTouchTime: number | undefined = undefined
        n.elem.addEventListener('touchstart', () => {
          // dblclick
          const now = Date.now()
          if (lastTouchTime && now - lastTouchTime < 300) {
            dblclick(i)
          }
          lastTouchTime = now
        })
      }
    })
  }

  protected hookPageTouch() {
    if (!this.enabledPageList) return
    const doc = this.doc
    const viewWidth = this.viewWidth
    const scrollContainer = this.scrollContainer
    if (!doc || !viewWidth || !scrollContainer) return

    let startX: number | undefined = undefined

    const startlistener = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      startX = touch.clientX
    }

    const movelistener = (event: TouchEvent) => {
      event.preventDefault()
      if (startX === undefined) return
      const touch = event.touches[0]
      if (!touch) return
      const deltaX = touch.clientX - startX
      doc.body.style.transform = `translateX(${deltaX}px)`
    }

    const endlistener = (event: TouchEvent) => {
      if (startX === undefined) return
      const touch = event.changedTouches[0]
      if (!touch) return
      doc.body.style.transform = 'none'
      const deltaX = touch.clientX - startX
      scrollContainer.scrollLeft -= deltaX
      const minX = viewWidth / 5
      if (deltaX < -minX) {
        void this.player.nextPage(1, true)
      } else if (deltaX > minX) {
        void this.player.prevPage(1, true)
      } else {
        void this.pushPageListAdjust(0, false)
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
    this.onUnmount(() => {
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
    this.onUnmount(() => {
      doc.documentElement.removeEventListener('wheel', listener)
    })
  }

  protected viewCalculate(doc: Document) {
    const htmlRect = doc.documentElement.getBoundingClientRect()
    this.viewWidth = htmlRect.width
    this.viewHeight = htmlRect.height
    // eslint-disable-next-line no-console
    console.debug(`viewWidth: ${this.viewWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`viewHeight: ${this.viewHeight}`)
  }

  protected detectScrollContainer(doc: Document) {
    const body = doc.body
    const html = doc.documentElement
    const container = body.scrollHeight > body.clientHeight ? body : html

    // eslint-disable-next-line no-console
    console.debug(
      `body: scrollHeight:${body.scrollHeight} clientHeight:${body.clientHeight}`,
    )
    // eslint-disable-next-line no-console
    console.debug(
      `body: scrollWidth:${body.scrollWidth} clientWidth:${body.clientWidth}`,
    )
    // eslint-disable-next-line no-console
    console.debug(
      `html: scrollHeight:${html.scrollHeight} clientHeight:${html.clientHeight}`,
    )
    // eslint-disable-next-line no-console
    console.debug(
      `html: scrollWidth:${html.scrollWidth} clientWidth:${html.clientWidth}`,
    )
    // eslint-disable-next-line no-console
    console.debug(`scrollContainer: ${container.tagName}`)
    return container
  }

  protected async pageListCalculate(doc: Document) {
    if (!this.viewWidth || !this.scrollContainer) return

    const html = doc.documentElement
    const pageListType = this.pageListType()

    // update column count
    const columnCount = pageListType === 'single' ? 1 : 2
    const columnWidth = this.viewWidth / columnCount
    html.style.setProperty('--main-column-count', columnCount.toString())
    html.style.setProperty('--main-column-width', `${columnWidth}px`)
    this.pageListColumnWidth = columnWidth

    this.pageListResizeImgs(doc, this.pageListColumnWidth)

    let scrollWidth = this.scrollContainer.scrollWidth
    let pageCount: number

    // update page list width
    doc.querySelector(`.${COLUMN_BREAK_CLASS}`)?.remove()
    if (pageListType === 'double') {
      // fix column double last page
      pageCount = Math.round((2 * scrollWidth) / this.viewWidth)
      if (pageCount % 2 === 1) {
        // add empty page & update the scrollWidth
        pageCount += 1
        const p = doc.createElement('p')
        p.classList.add(COLUMN_BREAK_CLASS)
        doc.body.appendChild(p)
        scrollWidth = this.scrollContainer.scrollWidth
      }
      pageCount /= 2
    } else {
      pageCount = Math.round(scrollWidth / this.viewWidth)
    }

    this.states.pageListCount = pageCount
    // eslint-disable-next-line no-console
    console.debug(`scrollWidth: ${scrollWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`pageListColumnWidth: ${this.pageListColumnWidth}`)
    // eslint-disable-next-line no-console
    console.debug(`pageListCount: ${this.states.pageListCount}`)

    this.parsePageList(this.scrollContainer)
  }

  protected resizeImgs(doc: Document) {
    const imgClasses = [IMG_MAX_WIDTH_CLASS, IMG_MAX_HEIGHT_CLASS]
    const imgs = doc.querySelectorAll('img')

    // remove classes
    for (const img of imgs) {
      img.classList.remove(...imgClasses)
    }

    if (!this.viewWidth) return

    if (this.pageListType() === 'none') {
      for (const img of imgs) {
        if (img.width > this.viewWidth) img.classList.add(IMG_MAX_WIDTH_CLASS)
      }
    }
  }

  protected pageListResizeImgs(doc: Document, columnWidth: number) {
    if (!this.viewHeight) return
    const imgs = doc.querySelectorAll('img')

    const pageWHRate = columnWidth / this.viewHeight
    for (const img of imgs) {
      if (img.width > columnWidth || img.height > this.viewHeight)
        img.classList.add(
          img.naturalWidth / img.naturalHeight > pageWHRate
            ? IMG_MAX_WIDTH_CLASS
            : IMG_MAX_HEIGHT_CLASS,
        )
    }
  }

  protected parsePageList(scrollContainer: HTMLElement) {
    const viewWidth = this.viewWidth
    if (!viewWidth) return
    if (!this.states.pageListCount) return

    this.pageList = range(0, this.states.pageListCount)
      .map((i) => i * viewWidth)
      .map((scrollLeft) => ({ scrollLeft }))

    const parentLeft = scrollContainer.getBoundingClientRect().left
    for (const [paragraph, readablePart] of this.readableParts.entries()) {
      const rect = readablePart.elem.getBoundingClientRect()
      const scrollLeft =
        rect.left + readablePart.elem.offsetWidth / 2 - parentLeft
      const page = findLast(
        this.pageList,
        (page) => page.scrollLeft <= scrollLeft,
      )
      if (page && !page.topmost)
        page.topmost = {
          readablePart,
          paragraph,
        }
    }
  }

  protected updatePageListFocus() {
    if (!this.pageList || this.states.pageListCurIndex === undefined) return

    // update focus part
    const paragraph = this.states.pos.paragraph
    const pageListPosIndex = findLastIndex(
      this.pageList,
      (page) => !!page.topmost && page.topmost.paragraph <= paragraph,
    )
    if (pageListPosIndex === this.states.pageListCurIndex) {
      // use the pos paragraph as resize focus
      this.pageListResizeFocusPart = this.readableParts.at(paragraph)
    } else {
      // use pageListCurIndex as resize focus
      this.pageListResizeFocusPart = this.pageList.at(
        this.states.pageListCurIndex,
      )?.topmost?.readablePart
    }
  }

  #paragraphLastActive?: ReadablePart
  protected updateParagraphActive() {
    this.tryManipulateDOM(() => {
      const item = this.readableParts.at(this.states.pos.paragraph)
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
      if (!this.states.bookmarks || !this.doc) return
      for (const item of Array.from(
        this.doc.querySelectorAll(`.${PARA_BOOKMARK_CLASS}`),
      )) {
        item.classList.remove(PARA_BOOKMARK_CLASS)
      }
      for (const bookmark of this.states.bookmarks) {
        if (bookmark.section !== this.states.pos.section) continue
        const item = this.readableParts.at(bookmark.paragraph)
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
      (nav): nav is RequiredNav => nav.spineIndex === this.states.pos.section,
    )

    const findNav = (): BookNav | undefined => {
      // get last nav of less than spineIndex
      if (navs.length === 0) {
        const lastNav = findLast(
          this.book.flattenedNavs,
          (nav) => !!nav.spineIndex && nav.spineIndex < this.states.pos.section,
        )
        return lastNav
      }

      // last anchor from iframe page
      const readableParts = this.readableParts
      const lastAnchors = findLast(
        readableParts.slice(0, this.states.pos.paragraph + 1),
        (part) => !!part.navAnchorIds,
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
        index,
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
