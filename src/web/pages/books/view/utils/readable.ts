import {
  PARA_BOX_CLASS,
  PARA_IGNORE_CLASS,
} from '../../../../../core/consts.js'
import { orderBy } from '../../../../../core/util/collection.js'
import {
  isElement,
  isImageElement,
  isTextNode,
} from '../../../../../core/util/dom.js'
import type { ReadablePart, TextAlias } from '../types.js'

export function* walkerNode(doc: Document, root: HTMLElement) {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ALL)

  while (true) {
    const curNode = walker.nextNode()
    if (curNode) yield curNode
    else break
  }
}

const isBlockElem = (elem: HTMLElement) => {
  const display = getComputedStyle(elem).getPropertyValue('display')
  return !['inline', 'inline-block'].includes(display)
}

const isIgnoreVerticalAlign = (elem: HTMLElement) => {
  const verticalAlign =
    getComputedStyle(elem).getPropertyValue('vertical-align')
  return ['super'].includes(verticalAlign)
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
      }
    | {
        type: 'text'
        elem: Text
        anchors: string[] | undefined
      }
  )[] = []
  #accAnchors?: string[]
  #alias: TextAlias[] = []

  constructor(private doc: Document) {
    this.walk()
  }

  walk() {
    // walk
    for (const node of walkerNode(this.doc, this.doc.body)) {
      // hashes
      if (isElement(node)) {
        if (node.id) {
          this.addAnchor(node.id)
        }

        if (node.tagName.toLowerCase() === 'ruby') {
          this.addRuby(node)
        }
      }

      // image
      if (isImageElement(node)) {
        this.addImage(node)
        continue
      }

      if (isElement(node)) {
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
    const acc = this.#accAnchors
    this.#accAnchors = undefined
    return acc
  }

  addAnchor(id: string) {
    this.#accAnchors ??= []
    this.#accAnchors.push(id)
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
    this.#parts.push({ type: 'image', elem, anchors: this.popAccAnchors() })
  }

  addText(text: Text) {
    this.#parts.push({
      type: 'text',
      elem: text,
      anchors: this.popAccAnchors(),
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
      anchors: string[] | undefined
    ) => {
      blockElem.classList.add(PARA_BOX_CLASS)
      const textContent = this.getContentText(blockElem)
      const notEmpty = !!textContent?.trim()
      if (notEmpty) {
        const part: ReadablePart = {
          elem: blockElem,
          type: 'text',
          text: textContent,
          anchorIds: anchors,
        }
        blockMap.set(blockElem, part)
        readableParts.push(part)
      } else {
        blockMap.set(blockElem, null)
      }
    }

    const readableParts: ReadablePart[] = []
    for (const { type, elem, anchors } of this.#parts) {
      if (type === 'image') {
        // image
        elem.classList.add(PARA_BOX_CLASS)
        readableParts.push({
          elem,
          type: 'image',
          anchorIds: anchors,
        })
      } else if (type === 'text') {
        // text

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
          continue
        }

        if (isAllInlineChild(blockElem) && blockElem !== this.doc.body) {
          addTextPart(blockElem, anchors)
        } else {
          // split block
          if (!elem.parentElement) continue
          const wrapElem = this.doc.createElement('span')
          elem.after(wrapElem)
          wrapElem.appendChild(elem)
          addTextPart(wrapElem, anchors)
        }
      }
    }
    return readableParts
  }

  alias() {
    return orderBy(this.#alias, 'desc', (a) => a.source.length)
  }
}
