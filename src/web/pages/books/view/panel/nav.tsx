import { t } from 'i18next'
import { useEffect, useMemo, useRef } from 'react'
import type { BookViewRes } from '../../../../../core/api/books/view.js'
import type { BookNav } from '../../../../../core/book/book-base.js'
import type { Player } from '../player.js'

function NavList(props: {
  navs: BookNav[]
  focusedNavs: BookNav[]
  player: Player
}) {
  const { navs, focusedNavs, player } = props
  if (!navs.length) return null

  return (
    <ul>
      {navs.map((nav, idx) => {
        const textCls: string[] = ['text']
        if (nav.spineIndex !== undefined && focusedNavs.includes(nav))
          textCls.push('active')
        if (nav.href) textCls.push('clickable')
        return (
          <li key={idx} data-href={nav.href} data-spine-index={nav.spineIndex}>
            <div
              className="item"
              onClick={(event) => {
                event.stopPropagation()
                if (nav.href) player.gotoUrlPath(nav.href).catch(console.error)
              }}
            >
              <div className={textCls.join(' ')}>{nav.label}</div>
            </div>
            <NavList
              navs={nav.children}
              focusedNavs={focusedNavs}
              player={player}
            ></NavList>
          </li>
        )
      })}
    </ul>
  )
}

function NavTree(props: {
  book: BookViewRes
  focusedNavs?: BookNav[]
  player: Player
}) {
  const { book, focusedNavs, player } = props
  const refNav = useRef<HTMLDivElement>(null)

  const lastFocusedNav = useMemo(() => {
    return focusedNavs?.at(-1)
  }, [focusedNavs])

  // scroll to last focused nav
  useEffect(() => {
    if (!lastFocusedNav) return
    const navDiv = refNav.current
    if (!navDiv) return
    const lastNavDiv = [...navDiv.querySelectorAll('div.text.active')].at(-1)
    lastNavDiv?.scrollIntoView({
      block: 'center',
    })
  }, [lastFocusedNav])

  return (
    <div ref={refNav} className="panel-content book-nav">
      {book.navs.length ? (
        <NavList
          navs={book.navs}
          focusedNavs={focusedNavs ?? []}
          player={player}
        />
      ) : (
        t('desc.navEmpty')
      )}
    </div>
  )
}

export function useBookViewNav(
  book: BookViewRes,
  player: Player,
  focusedNavs?: BookNav[]
) {
  return {
    NavTreeView: (
      <NavTree book={book} player={player} focusedNavs={focusedNavs}></NavTree>
    ),
  }
}
