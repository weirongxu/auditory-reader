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
  const $ = (id: string) => doc.querySelector(`#${id}`) as HTMLElement
  return { doc, $ }
}

describe('removeEdgePageBreaks', () => {
  it('removes break-after when it contains the last content', () => {
    const { $ } = setup()
    const trailing = $('trailing')
    const content = $('last-content').firstChild!
    const spy = vi.spyOn(trailing.style, 'removeProperty')
    removeEdgePageBreaks([trailing], [], [content])
    expect(spy).toHaveBeenCalledWith('break-after')
  })

  it('keeps break-after when content follows', () => {
    const { $ } = setup()
    const middle = $('middle')
    const lastContent = $('last-content').firstChild!
    const spy = vi.spyOn(middle.style, 'removeProperty')
    removeEdgePageBreaks([middle], [], [lastContent])
    expect(spy).not.toHaveBeenCalled()
  })

  it('removes multiple trailing break-afters', () => {
    const doc = createDoc(
      '<div id="a">text</div><div id="b"></div><div id="c"></div>',
    )
    const $ = (id: string) => doc.querySelector(`#${id}`) as HTMLElement
    const content = $('a').firstChild!
    const spyB = vi.spyOn($('b').style, 'removeProperty')
    const spyC = vi.spyOn($('c').style, 'removeProperty')
    removeEdgePageBreaks([$('a'), $('b'), $('c')], [], [content])
    expect(spyB).toHaveBeenCalledWith('break-after')
    expect(spyC).toHaveBeenCalledWith('break-after')
  })

  it('removes break-before when no content precedes', () => {
    const { $ } = setup()
    const first = $('first')
    const content = first.querySelector('span')!.firstChild!
    const spy = vi.spyOn(first.style, 'removeProperty')
    removeEdgePageBreaks([], [first], [content])
    expect(spy).toHaveBeenCalledWith('break-before')
  })

  it('keeps break-before when content precedes', () => {
    const { $ } = setup()
    const trailing = $('trailing')
    const firstContent = $('first').querySelector('span')!.firstChild!
    const spy = vi.spyOn(trailing.style, 'removeProperty')
    removeEdgePageBreaks([], [trailing], [firstContent])
    expect(spy).not.toHaveBeenCalled()
  })
})
