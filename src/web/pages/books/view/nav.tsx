import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BookViewRes } from '../../../../core/api/books/view.js'
import type { BookNav } from '../../../../core/book/book-base.js'
import { compact } from '../../../../core/util/collection.js'
import type { Player } from './player.js'

export function useBookViewNav(
  book: BookViewRes,
  player: Player,
  focusedNavs?: Set<BookNav>
) {
  const [visible, setVisible] = useState<boolean>(false)
  const refNavTreeview = useRef<HTMLDivElement>(null)

  const toggleNav = useCallback(() => {
    setVisible((v) => !v)
  }, [])

  useEffect(() => {
    if (!visible) return
    const navTreeviewDiv = refNavTreeview.current
    if (!navTreeviewDiv) return
    setTimeout(() => {
      navTreeviewDiv.querySelector('div.item.active')?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      })
    }, 100)
  }, [visible])

  const NavTreeView = useMemo(() => {
    const getList = (navs: BookNav[]): JSX.Element => {
      return (
        <ul>
          {navs.map((nav, idx) => {
            const chidlren =
              nav.children.length > 0 ? getList(nav.children) : null
            const itemCls = compact([
              'item',
              nav.spineIndex !== undefined && focusedNavs?.has(nav)
                ? 'active'
                : undefined,
              nav.href ? 'clickable' : undefined,
            ]).join(' ')
            return (
              <li
                key={idx}
                onClick={(event) => {
                  event.stopPropagation()
                  if (nav.href) player.gotoUrl(nav.href).catch(console.error)
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
      <div ref={refNavTreeview} className="book-nav">
        {getList(book.navs)}
      </div>
    ) : null
  }, [visible, book.navs, focusedNavs, player])

  return {
    toggleNav,
    NavTreeView,
  }
}
