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

  useEffect(() => {
    if (!visible || !lastFocusedNav) return
    const navDiv = refNav.current
    if (!navDiv) return
    setTimeout(() => {
      const lastNavDiv = [...navDiv.querySelectorAll('div.item.active')].at(-1)
      lastNavDiv?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 100)
  }, [visible, lastFocusedNav])

  const NavTreeView = useMemo(() => {
    const getList = (navs: BookNav[]): JSX.Element => {
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
    }

    return visible ? (
      <div ref={refNav} className="book-nav">
        {getList(book.navs)}
      </div>
    ) : null
  }, [visible, book.navs, focusedNavs, player])

  return {
    toggleNav,
    NavTreeView,
  }
}
