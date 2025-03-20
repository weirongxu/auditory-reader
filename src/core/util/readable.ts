import type { BookTypes } from '../book/types.js'
import { PARA_BOX_CLASS, PARA_IGNORE_CLASS } from '../consts.js'
import { compact, orderBy } from './collection.js'
import {
  isContainBr,
  isElement,
  isImageElement,
  isTextNode,
  requiredDomView,
  splitByBr,
  wrapNode,
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

function isBlockElem(elem: HTMLElement) {
  const display = getComputedStyle(elem).getPropertyValue('display')
  if (!display) return !inlineElementNames.includes(elem.tagName.toLowerCase())
  return !['inline', 'inline-block'].includes(display)
}

const isIgnoreVerticalAlign = (elem: HTMLElement) => {
  const verticalAlign =
    getComputedStyle(elem).getPropertyValue('vertical-align')
  return verticalAlign && ['top', 'bottom'].includes(verticalAlign)
}

const ignoreTagNames = [
  // ruby > rt
  'rt',
  'noscript',
]

function getParentBlockElem(elem: HTMLElement | null): HTMLElement | undefined {
  if (!elem) return
  if (isBlockElem(elem)) {
    return elem
  } else if (elem.parentElement) {
    return getParentBlockElem(elem.parentElement)
  }
}

function fixPageBreak(elem: HTMLElement) {
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
    if (!isElement(node)) continue
    if (
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
    private flattenedNavs: BookTypes.Nav[],
  ) {
    this.#navAnchorSet = new Set(
      compact(this.flattenedNavs.map((n) => n.hrefAnchor)),
    )
    this.walk()
  }

  walk() {
    // walk
    for (const node of walkerNode(this.doc, this.doc.body)) {
      if (isElement(node)) {
        // anchors
        if (node.id) {
          this.addAnchor(node.id, this.#navAnchorSet.has(node.id))
        }

        // ruby
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
        if (ignoreTagNames.includes(tagName)) {
          node.classList.add(PARA_IGNORE_CLASS)
          continue
        }

        // skip ignored vertical-align
        if (isIgnoreVerticalAlign(node)) {
          node.classList.add(PARA_IGNORE_CLASS)
          continue
        }

        // skip invisible
        const isVisible =
          // JSDom not support checkVisibility
          // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-unnecessary-condition
          node.checkVisibility
            ? node.checkVisibility({
                contentVisibilityAuto: true,
                checkOpacity: true,
                visibilityProperty: true,
              })
            : true
        if (!isVisible) {
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
    ): ReadablePart | null => {
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
        return part
      } else {
        blockMap.set(blockElem, null)
        return null
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
            if (isContainBr(blockElem)) {
              const nodesGroup = splitByBr(blockElem)
              for (const [i, nodes] of nodesGroup.entries()) {
                const wrapElem = wrapNode(nodes, 'span')
                const part = addTextPart(wrapElem, anchors, navAnchors)
                if (i === 0) blockMap.set(blockElem, part)
              }
            } else addTextPart(blockElem, anchors, navAnchors)
          } else {
            // split block
            if (!elem.parentElement) continue
            const wrapElem = wrapNode([elem], 'span')
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
