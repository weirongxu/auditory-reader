import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BookViewRes } from '../../../../core/api/books/view.js'
import type { BookNav } from '../../../../core/book/book-base.js'
import { compact } from '../../../../core/util/collection.js'
import type { Player } from './player.js'

export function useBookViewNav(
  book: BookViewRes,
  player: Player,
  focusedNavs?: BookNav[]
) {
  const [visible, setVisible] = useState<boolean>(false)
  const refNav = useRef<HTMLDivElement>(null)

  const toggleNav = useCallback(() => {
    setVisible((v) => !v)
  }, [])

  const lastFocusedNav = useMemo(() => {
    return focusedNavs?.at(-1)
  }, [focusedNavs])

  const getList = useCallback(
    (navs: BookNav[]): JSX.Element => {
      return (
        <ul>
          {navs.map((nav, idx) => {
            const chidlren =
              nav.children.length > 0 ? getList(nav.children) : null
            const itemCls = compact([
              'item',
              nav.spineIndex !== undefined && focusedNavs?.includes(nav)
                ? 'active'
                : undefined,
              nav.href ? 'clickable' : undefined,
            ]).join(' ')
            return (
              <li
                key={idx}
                data-href={nav.href}
                data-spine-index={nav.spineIndex}
                onClick={(event) => {
                  event.stopPropagation()
                  if (nav.href)
                    player.gotoUrlPath(nav.href).catch(console.error)
                }}
              >
                <div className={itemCls}>{nav.label}</div>
                {chidlren}
              </li>
            )
          })}
        </ul>
      )
    },
    [focusedNavs, player]
  )

  const NavTreeView = useMemo(() => {
    const list = getList(book.navs)
    return visible ? (
      <div ref={refNav} className="book-nav">
        {list}
      </div>
    ) : null
  }, [getList, book.navs, visible])

  // scroll to nav
  useEffect(() => {
    if (!visible || !lastFocusedNav) return
    const navDiv = refNav.current
    if (!navDiv) return
    const lastNavDiv = [...navDiv.querySelectorAll('div.item.active')].at(-1)
    lastNavDiv?.scrollIntoView({
      block: 'center',
    })
  }, [visible, lastFocusedNav])

  return {
    toggleNav,
    NavTreeView,
  }
}
