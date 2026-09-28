import { JSDOM } from 'jsdom'
import { describe, expect, it, vi } from 'vitest'

import { removeEdgePageBreaks } from './readable.js'

const createDoc = (bodyHtml: string) => {
  const { window } = new JSDOM(
    `<!doctype html><html><body>${bodyHtml}</body></html>`,
  )
  return window.document
}

const setup = () => {
  const doc = createDoc(`
    <div id="first"><span>head</span></div>
    <p id="middle">middle content</p>
    <div id="trailing"><p id="last-content">last</p></div>
  `)
  const $ = create$(doc)
  return { doc, $ }
}

const create$ = (doc: Document) => (id: string) => {
  const elem = doc.querySelector<HTMLElement>(`#${id}`)
  if (!elem) throw new Error(`element #${id} not found`)
  return elem
}

const requiredChild = (parent: HTMLElement, selector: string) => {
  const elem = parent.querySelector<HTMLElement>(selector)
  if (!elem) throw new Error(`element ${selector} not found`)
  return elem
}

const requiredFirstChild = (elem: HTMLElement) => {
  const child = elem.firstChild
  if (!child) throw new Error('firstChild not found')
  return child
}

describe('removeEdgePageBreaks', () => {
  it('removes break-after when it contains the last content', () => {
    const { $ } = setup()
    const trailing = $('trailing')
    const content = requiredFirstChild($('last-content'))
    const spy = vi.spyOn(trailing.style, 'removeProperty')
    removeEdgePageBreaks([trailing], [], [content])
    expect(spy).toHaveBeenCalledWith('break-after')
  })

  it('keeps break-after when content follows', () => {
    const { $ } = setup()
    const middle = $('middle')
    const lastContent = requiredFirstChild($('last-content'))
    const spy = vi.spyOn(middle.style, 'removeProperty')
    removeEdgePageBreaks([middle], [], [lastContent])
    expect(spy).not.toHaveBeenCalled()
  })

  it('removes multiple trailing break-afters', () => {
    const doc = createDoc(
      '<div id="a">text</div><div id="b"></div><div id="c"></div>',
    )
    const $ = create$(doc)
    const content = requiredFirstChild($('a'))
    const spyB = vi.spyOn($('b').style, 'removeProperty')
    const spyC = vi.spyOn($('c').style, 'removeProperty')
    removeEdgePageBreaks([$('a'), $('b'), $('c')], [], [content])
    expect(spyB).toHaveBeenCalledWith('break-after')
    expect(spyC).toHaveBeenCalledWith('break-after')
  })

  it('removes break-before when no content precedes', () => {
    const { $ } = setup()
    const first = $('first')
    const content = requiredFirstChild(requiredChild(first, 'span'))
    const spy = vi.spyOn(first.style, 'removeProperty')
    removeEdgePageBreaks([], [first], [content])
    expect(spy).toHaveBeenCalledWith('break-before')
  })

  it('keeps break-before when content precedes', () => {
    const { $ } = setup()
    const trailing = $('trailing')
    const firstContent = requiredFirstChild(requiredChild($('first'), 'span'))
    const spy = vi.spyOn(trailing.style, 'removeProperty')
    removeEdgePageBreaks([], [trailing], [firstContent])
    expect(spy).not.toHaveBeenCalled()
  })
})
