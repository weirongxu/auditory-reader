import type { BookNav } from '../book/book-base.js'
import { PARA_BOX_CLASS, PARA_IGNORE_CLASS } from '../consts.js'
import { compact, orderBy } from './collection.js'
import {
  isElement,
  isImageElement,
  isTextNode,
  requiredDomView,
} from './dom.js'

interface ReadablePartBase {
  elem: HTMLElement
  anchorIds: string[] | undefined
  navAnchorIds: string[] | undefined
}

export interface ReadablePartText extends ReadablePartBase {
  type: 'text'
  text: string
}

export interface ReadablePartImage extends ReadablePartBase {
  type: 'image'
}

export type ReadablePart = ReadablePartText | ReadablePartImage

export interface TextAlias {
  source: string
  target: string
}

export function* walkerNode(doc: Document, root: HTMLElement) {
  const view = requiredDomView(root)
  const walker = doc.createTreeWalker(root, view.NodeFilter.SHOW_ALL)

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const curNode = walker.nextNode()
    if (curNode) yield curNode
    else break
  }
}

/**
 * JSDOM getComputedStyle is not fully compatible with the DOM API.
 * - Property default could be empty
 * - Property inheritance is not supported
 */
function getComputedStyle(elem: HTMLElement) {
  return requiredDomView(elem).getComputedStyle(elem)
}

const inlineElementNames = [
  'a',
  'abbr',
  'acronym',
  'b',
  'bdo',
  'big',
  'br',
  'button',
  'cite',
  'code',
  'dfn',
  'em',
  'i',
  'img',
  'input',
  'kbd',
  'label',
  'map',
  'object',
  'output',
  'q',
  'samp',
  'script',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'textarea',
  'time',
  'tt',
  'var',
]

const isBlockElem = (elem: HTMLElement) => {
  const display = getComputedStyle(elem).getPropertyValue('display')
  if (!display) return !inlineElementNames.includes(elem.tagName.toLowerCase())
  return !['inline', 'inline-block'].includes(display)
}

const isIgnoreVerticalAlign = (elem: HTMLElement) => {
  const verticalAlign =
    getComputedStyle(elem).getPropertyValue('vertical-align')
  return verticalAlign && verticalAlign !== 'baseline'
}

const getParentBlockElem = (
  elem: HTMLElement | null,
): HTMLElement | undefined => {
  if (!elem) return
  if (isBlockElem(elem)) {
    return elem
  } else if (elem.parentElement) {
    return getParentBlockElem(elem.parentElement)
  }
}

const fixPageBreak = (elem: HTMLElement) => {
  const style = getComputedStyle(elem)
  const breakBeforeList = [
    style.getPropertyValue('page-break-before'),
    style.getPropertyValue('break-before'),
  ]
  if (breakBeforeList.some((b) => b === 'always')) {
    elem.style.breakBefore = 'column'
  }
  const breakAfters = [
    style.getPropertyValue('page-break-after'),
    style.getPropertyValue('break-after'),
  ]
  if (breakAfters.some((b) => b === 'always')) {
    elem.style.breakAfter = 'column'
  }
}

function isAllInlineChild(elem: HTMLElement) {
  if (elem.dataset.isAllInlineChild !== undefined) {
    return elem.dataset.isAllInlineChild === '1'
  }
  for (const node of elem.childNodes) {
    if (
      isElement(node) &&
      !node.classList.contains(PARA_IGNORE_CLASS) &&
      (isBlockElem(node) || !isAllInlineChild(node))
    ) {
      elem.dataset.isAllInlineChild = '0'
      return false
    }
  }
  elem.dataset.isAllInlineChild = '1'
  return true
}

export class ReadableExtractor {
  #parts: (
    | {
        type: 'image'
        elem: HTMLImageElement
        anchors: string[] | undefined
        navAnchors: string[] | undefined
      }
    | {
        type: 'text'
        elem: Text
        anchors: string[] | undefined
        navAnchors: string[] | undefined
      }
  )[] = []
  #accAnchors?: string[]
  #accNavAnchors?: string[]
  #alias: TextAlias[] = []
  #navAnchorSet: Set<string>

  constructor(
    private doc: Document,
    private flattenedNavs: BookNav[],
  ) {
    this.#navAnchorSet = new Set(
      compact(this.flattenedNavs.map((n) => n.hrefAnchor)),
    )
    this.walk()
  }

  walk() {
    // walk
    for (const node of walkerNode(this.doc, this.doc.body)) {
      // anchors
      if (isElement(node)) {
        if (node.id) {
          this.addAnchor(node.id, this.#navAnchorSet.has(node.id))
        }

        if (node.tagName.toLowerCase() === 'ruby') {
          this.addRuby(node)
        }

        fixPageBreak(node)

        // image
        if (isImageElement(node)) {
          this.addImage(node)
          continue
        }

        // skip tag like: ruby > rt
        const tagName = node.tagName.toLowerCase()
        if (tagName === 'rt') {
          node.classList.add(PARA_IGNORE_CLASS)
          continue
        }

        // skip ignored vertical-align
        if (isIgnoreVerticalAlign(node)) {
          node.classList.add(PARA_IGNORE_CLASS)
          continue
        }
      }

      // not text
      if (!isTextNode(node)) continue

      // no content
      const content = node.textContent?.trim()
      if (!content) continue

      this.addText(node)
    }
  }

  private popAccAnchors() {
    const anchors = this.#accAnchors
    const navAnchors = this.#accNavAnchors
    this.#accAnchors = undefined
    this.#accNavAnchors = undefined
    return { anchors, navAnchors }
  }

  addAnchor(id: string, isNavAnchor: boolean) {
    this.#accAnchors ??= []
    this.#accAnchors.push(id)
    if (isNavAnchor) {
      this.#accNavAnchors ??= []
      this.#accNavAnchors.push(id)
    }
  }

  addRuby(elem: HTMLElement) {
    let source = ''
    let target = ''
    for (const node of walkerNode(this.doc, elem)) {
      if (isElement(node) && node.tagName.toLowerCase() === 'rt') {
        target += node.textContent
      } else if (isTextNode(node) && !node.parentElement?.closest('rt')) {
        source += node.textContent
      }
    }
    if (source && target) {
      elem.dataset.isAlias = '1'
      this.#alias.push({
        source,
        target,
      })
    }
  }

  addImage(elem: HTMLImageElement) {
    const { anchors, navAnchors } = this.popAccAnchors()
    this.#parts.push({ type: 'image', elem, anchors, navAnchors })
  }

  addText(text: Text) {
    const { anchors, navAnchors } = this.popAccAnchors()
    this.#parts.push({
      type: 'text',
      elem: text,
      anchors,
      navAnchors,
    })
  }

  private getContentText(elem: HTMLElement) {
    let contentText = ''
    for (const node of walkerNode(elem.ownerDocument, elem)) {
      if (!isTextNode(node)) continue
      if (!node.parentElement) continue
      if (node.parentElement.closest(`.${PARA_IGNORE_CLASS}`)) continue
      contentText += node.textContent
    }
    return contentText
  }

  toReadableParts() {
    const blockMap = new Map<HTMLElement, null | ReadablePart>()

    const addTextPart = (
      blockElem: HTMLElement,
      anchors: string[] | undefined,
      navAnchors: string[] | undefined,
    ) => {
      blockElem.classList.add(PARA_BOX_CLASS)
      const textContent = this.getContentText(blockElem)
      const notEmpty = !!textContent.trim()
      if (notEmpty) {
        const part: ReadablePart = {
          elem: blockElem,
          type: 'text',
          text: textContent,
          anchorIds: anchors,
          navAnchorIds: navAnchors,
        }
        blockMap.set(blockElem, part)
        readableParts.push(part)
      } else {
        blockMap.set(blockElem, null)
      }
    }

    const readableParts: ReadablePart[] = []
    for (const { type, elem, anchors, navAnchors } of this.#parts) {
      switch (type) {
        case 'image': {
          elem.classList.add(PARA_BOX_CLASS)
          readableParts.push({
            elem,
            type: 'image',
            anchorIds: anchors,
            navAnchorIds: navAnchors,
          })
          break
        }
        case 'text': {
          // no parent
          const blockElem = getParentBlockElem(elem.parentElement)
          if (!blockElem) continue

          // ignore class
          if (blockElem.classList.contains(PARA_IGNORE_CLASS)) continue

          // avoid duplicated
          const part = blockMap.get(blockElem)
          if (part) {
            if (anchors) {
              part.anchorIds ??= []
              part.anchorIds.push(...anchors)
            }
            if (navAnchors) {
              part.navAnchorIds ??= []
              part.navAnchorIds.push(...navAnchors)
            }
            continue
          }

          if (isAllInlineChild(blockElem) && blockElem !== this.doc.body) {
            addTextPart(blockElem, anchors, navAnchors)
          } else {
            // split block
            if (!elem.parentElement) continue
            const wrapElem = this.doc.createElement('span')
            elem.after(wrapElem)
            wrapElem.appendChild(elem)
            addTextPart(wrapElem, anchors, navAnchors)
          }
          break
        }
      }
    }
    return readableParts
  }

  alias() {
    return orderBy(this.#alias, 'desc', (a) => a.source.length)
  }
}
