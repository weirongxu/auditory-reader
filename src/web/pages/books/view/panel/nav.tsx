import { t } from 'i18next'
import { useEffect, useMemo, useRef } from 'react'
import type { BookViewRes } from '../../../../../core/api/books/view.js'
import type { BookNav } from '../../../../../core/book/book-base.js'
import type { Player } from '../player.js'

function NavList(props: {
  navs: BookNav[]
  activeNavs: BookNav[]
  player: Player
}) {
  const { navs, activeNavs, player } = props
  if (!navs.length) return null

  return (
    <ul>
      {navs.map((nav, idx) => {
        const textCls: string[] = ['text']
        if (nav.spineIndex !== undefined && activeNavs.includes(nav))
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
              activeNavs={activeNavs}
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
  activeNavs?: BookNav[]
  player: Player
}) {
  const { book, activeNavs, player } = props
  const refNav = useRef<HTMLDivElement>(null)

  const lastActiveNav = useMemo(() => {
    return activeNavs?.at(-1)
  }, [activeNavs])

  // scroll to last active nav
  useEffect(() => {
    if (!lastActiveNav) return
    const navDiv = refNav.current
    if (!navDiv) return
    const lastNavDiv = [...navDiv.querySelectorAll('div.text.active')].at(-1)
    lastNavDiv?.scrollIntoView({
      block: 'center',
    })
  }, [lastActiveNav])

  return (
    <div ref={refNav} className="panel-content book-nav">
      {book.navs.length ? (
        <NavList
          navs={book.navs}
          activeNavs={activeNavs ?? []}
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
  activeNavs?: BookNav[]
) {
  return {
    NavTreeView: (
      <NavTree book={book} player={player} activeNavs={activeNavs}></NavTree>
    ),
  }
}
