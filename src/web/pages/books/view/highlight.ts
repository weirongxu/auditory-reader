import { IGNORE_TAGS, PARA_HIGHLIGHT_CLASS } from '../../../../core/consts.js'
import type { ReadablePart } from './types.js'
import type { PlayerIframeController } from './player-iframe-controller.js'

const enum FindRangePosType {
  found,
  skip,
}

export class Highlight {
  highlightedElems: HTMLElement[] = []

  constructor(protected iframeCtrl: PlayerIframeController) {}

  #findRangePos(
    node: Node,
    index: number
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
      // text
      if (child.nodeType === Node.TEXT_NODE) {
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

      // ignore tags
      if (
        child instanceof Element &&
        IGNORE_TAGS.includes(child.tagName.toLowerCase())
      )
        continue

      // recursion
      const result = this.#findRangePos(child, remainIndex)
      if (result.type === FindRangePosType.found) {
        return result
      } else if (result.type === FindRangePosType.skip) {
        remainIndex = result.remainIndex
      }
    }
    return {
      type: FindRangePosType.skip,
      remainIndex,
    }
  }

  #getChildAndIndex(
    node: Node,
    index: number
  ): { node: Node; index: number } | null {
    const result = this.#findRangePos(node, index)
    if (result.type === FindRangePosType.found) {
      return result
    } else {
      return null
    }
  }

  highlightClear() {
    const parentSet = new Set<ParentNode>()
    while (this.highlightedElems.length) {
      const el = this.highlightedElems.pop()
      if (!el) break
      if (el.parentNode) parentSet.add(el.parentNode)
      el.replaceWith(...el.childNodes)
    }
    for (const parent of parentSet) {
      parent.normalize()
    }
  }

  highlight(node: ReadablePart, charIndex: number, charLength: number) {
    this.highlightClear()
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
    const span = document.createElement('span')
    span.classList.add(PARA_HIGHLIGHT_CLASS)
    this.highlightedElems.push(span)
    span.appendChild(range.extractContents())
    range.insertNode(span)
    span.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }
}
