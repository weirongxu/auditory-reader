import type { BookNav } from '../../../../../core/book/book-base.js'
import {
  IGNORE_TAGS,
  PARA_BLOCK_CLASS,
  PARA_IGNORE_CLASS,
} from '../../../../../core/consts.js'
import { compact } from '../../../../../core/util/collection.js'
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

export const getReadableParts = (doc: Document, navs: BookNav[]) => {
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

    if (blockElem.classList.contains(PARA_IGNORE_CLASS)) continue

    // avoid duplicated
    if (blockElemSet.has(blockElem)) continue

    if (isAllInlineChild(blockElem) && blockElem !== doc.body) {
      blockElemSet.add(blockElem)
      pushTextPart(blockElem)
    } else {
      if (!node.parentElement) continue
      const wrapElem = document.createElement('div')
      node.after(wrapElem)
      wrapElem.appendChild(node)
      blockElemSet.add(wrapElem)
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
