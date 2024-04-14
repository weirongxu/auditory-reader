import {
  PARA_HIGHLIGHT_CLASS,
  PARA_IGNORE_CLASS,
} from '../../../../core/consts.js'
import { sum } from '../../../../core/util/collection.js'
import { isElement, isTextNode } from '../../../../core/util/dom.js'
import { throttleFn } from '../../../../core/util/timer.js'
import type { PlayerIframeController } from './player-iframe-controller.js'
import type { PlayerStatesManager } from './player-states.js'
import type { ReadablePart, Rect } from './types.js'

const enum FindRangePosType {
  found,
  skip,
}

export class Highlight {
  highlightedElems: HTMLElement[] = []

  constructor(
    protected iframeCtrl: PlayerIframeController,
    protected states: PlayerStatesManager,
  ) {}

  get doc() {
    return this.iframeCtrl.doc
  }

  #hlRoot: HTMLDivElement | undefined
  #cacheHlRectMap = new Map<number, HTMLDivElement>()

  public reCreateRoot(doc: Document) {
    doc
      .querySelectorAll(`.${PARA_HIGHLIGHT_CLASS}`)
      .forEach((div) => div.remove())

    this.#hlRoot = doc.createElement('div')
    this.#hlRoot.classList.add(PARA_HIGHLIGHT_CLASS)
    doc.documentElement.appendChild(this.#hlRoot)
    this.#cacheHlRectMap.clear()
  }

  #highlightHide() {
    const hlRoot = this.#hlRoot
    if (!hlRoot) return
    Array.from(hlRoot.children).forEach((div) => {
      ;(div as HTMLDivElement).style.display = 'none'
    })
  }

  #highlightCharsByRects(range: Range) {
    const doc = this.doc
    const hlRoot = this.#hlRoot
    if (!doc || !hlRoot) return

    const getRectDiv = (idx: number) => {
      let div = this.#cacheHlRectMap.get(idx)
      if (!div) {
        div = doc.createElement('div')
        this.#cacheHlRectMap.set(idx, div)
        hlRoot.appendChild(div)
      }
      return div
    }

    const containerRect = doc.documentElement.getBoundingClientRect()
    const rects: Rect[] = [...range.getClientRects()].map((rect) => ({
      width: rect.width,
      height: rect.height,
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.right,
      top: rect.top - containerRect.top,
      bottom: rect.bottom - containerRect.top,
    }))
    this.#highlightHide()
    for (const [idx, rect] of rects.entries()) {
      const div = getRectDiv(idx)
      div.style.display = 'block'
      div.style.top = `${rect.top}px`
      div.style.left = `${rect.left}px`
      div.style.width = `${rect.width}px`
      div.style.height = `${rect.height}px`
    }

    this.#scrollToRects(rects)
  }

  #scrollToRects = throttleFn(1000, (rects: Rect[]) => {
    if (!this.doc) return
    if (!rects.length) return

    if (this.iframeCtrl.enabledPageList) {
      const left = sum(rects.map((r) => r.left)) / rects.length
      this.iframeCtrl.pageListScrollToLeft(left).catch(console.error)
    } else if (this.iframeCtrl.isVertical) {
      const right = sum(rects.map((r) => r.right)) / rects.length
      this.iframeCtrl.scrollToRight(right).catch(console.error)
    } else {
      const top = sum(rects.map((r) => r.top)) / rects.length
      this.iframeCtrl.scrollToTop(top).catch(console.error)
    }
  })

  #findRangePos(
    node: Node,
    index: number,
  ):
    | { type: FindRangePosType.found; node: Node; index: number }
    | { type: FindRangePosType.skip; remainIndex: number } {
    if (!node.childNodes.length)
      return {
        type: FindRangePosType.skip,
        remainIndex: index,
      }
    let remainIndex = index
    for (const child of node.childNodes) {
      if (isTextNode(child)) {
        // text
        if (!child.textContent) continue
        if (remainIndex < child.textContent.length) {
          return {
            type: FindRangePosType.found,
            node: child,
            index: remainIndex,
          }
        } else {
          remainIndex -= child.textContent.length
        }
        continue
      }

      if (isElement(child) && child.closest(`.${PARA_IGNORE_CLASS}`))
        // ignore class
        continue

      // recursion
      const result = this.#findRangePos(child, remainIndex)
      switch (result.type) {
        case FindRangePosType.found:
          return result
        case FindRangePosType.skip:
          remainIndex = result.remainIndex
          continue
      }
    }
    return {
      type: FindRangePosType.skip,
      remainIndex,
    }
  }

  #getChildAndIndex(
    node: Node,
    index: number,
  ): { node: Node; index: number } | null {
    const result = this.#findRangePos(node, index)
    if (result.type === FindRangePosType.found) {
      return result
    } else {
      return null
    }
  }

  #highlightChars(node: ReadablePart, charIndex: number, charLength: number) {
    if (!this.doc) return

    // get range
    const range = document.createRange()
    const start = this.#getChildAndIndex(node.elem, charIndex)
    if (!start) return
    const end = this.#getChildAndIndex(node.elem, charIndex + charLength)
    if (!end) return
    try {
      range.setStart(start.node, start.index)
      range.setEnd(end.node, end.index)
    } catch (error) {
      console.error(error)
      // skip range index error
      return
    }

    this.#highlightCharsByRects(range)
  }

  highlight(node: ReadablePart, charIndex: number, charLength: number) {
    this.iframeCtrl
      .tryManipulateDOM(() => {
        this.#highlightChars(node, charIndex, charLength)
      })
      .catch(console.error)
  }

  highlightHide() {
    this.iframeCtrl
      .tryManipulateDOM(() => {
        this.#highlightHide()
      })
      .catch(console.error)
  }
}
