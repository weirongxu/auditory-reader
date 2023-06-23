import type { BookNav } from '../../../../../core/book/book-base.js'
import {
  PARA_BOX_CLASS,
  PARA_IGNORE_CLASS,
} from '../../../../../core/consts.js'
import type { ReadablePart } from '../types.js'

export function* walkerNode(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)

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

const isAllInlineChild = (elem: HTMLElement) => {
  if (elem.dataset.isAllInlineChild !== undefined) {
    return elem.dataset.isAllInlineChild === '1'
  }
  for (const node of elem.childNodes) {
    if (
      node instanceof HTMLElement &&
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

function getContentText(elem: HTMLElement) {
  let contentText = ''
  for (const node of walkerNode(elem)) {
    if (!(node instanceof Text)) continue
    if (!node.parentElement) continue
    if (node.parentElement.closest(`.${PARA_IGNORE_CLASS}`)) continue
    contentText += node.textContent
  }
  return contentText
}

class ReadableManager {
  private parts: (
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
  private accAnchors?: string[]

  constructor(private doc: Document) {}

  popAccAnchors() {
    const acc = this.accAnchors
    this.accAnchors = undefined
    return acc
  }

  addAnchor(id: string) {
    this.accAnchors ??= []
    this.accAnchors.push(id)
  }

  addImage(elem: HTMLImageElement) {
    this.parts.push({ type: 'image', elem, anchors: this.popAccAnchors() })
  }

  addText(text: Text) {
    this.parts.push({
      type: 'text',
      elem: text,
      anchors: this.popAccAnchors(),
    })
  }

  toReadableParts() {
    const blockSet = new Set<HTMLElement>()

    function addText(blockElem: HTMLElement, anchors: string[] | undefined) {
      blockSet.add(blockElem)
      blockElem.classList.add(PARA_BOX_CLASS)
      const textContent = getContentText(blockElem)
      const notEmpty = !!textContent?.trim()
      if (notEmpty) {
        readableParts.push({
          elem: blockElem,
          type: 'text',
          text: textContent,
          anchorIds: anchors,
        })
      }
    }

    const readableParts: ReadablePart[] = []
    for (const { type, elem, anchors } of this.parts) {
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
        if (blockSet.has(blockElem)) continue

        if (isAllInlineChild(blockElem) && blockElem !== this.doc.body) {
          addText(blockElem, anchors)
        } else {
          // split block
          if (!elem.parentElement) continue
          const wrapElem = document.createElement('span')
          elem.after(wrapElem)
          wrapElem.appendChild(elem)
          addText(wrapElem, anchors)
        }
      }
    }
    return readableParts
  }
}

export const getReadableParts = (doc: Document, flattenedNavs: BookNav[]) => {
  const readableManager = new ReadableManager(doc)
  const navExistHashSet = new Set(
    flattenedNavs.filter((nav) => nav.hrefHash).map((nav) => nav.hrefHash)
  )

  // walk
  for (const node of walkerNode(doc.body)) {
    // hashes
    if (node instanceof HTMLElement) {
      if (node.id && navExistHashSet.has(node.id)) {
        readableManager.addAnchor(node.id)
      }
    }

    // image
    if (node instanceof HTMLImageElement) {
      readableManager.addImage(node)
      continue
    }

    if (node instanceof HTMLElement) {
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
    if (!(node instanceof Text)) continue

    // no content
    const content = node.textContent?.trim()
    if (!content) continue

    readableManager.addText(node)
  }

  return readableManager.toReadableParts()
}
