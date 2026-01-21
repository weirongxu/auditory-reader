import { t } from 'i18next'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { BookTypes } from '../../../../../core/book/types.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import type { BookView } from '../../view.js'
import type { Player } from '../player.js'

function NavList({
  navs,
  activeNavs,
  selectedNav,
  player,
}: {
  navs: BookTypes.Nav[]
  activeNavs: BookTypes.Nav[]
  selectedNav: BookTypes.Nav | undefined
  player: Player
}) {
  if (!navs.length) return null

  return (
    <ul>
      {navs.map((nav, idx) => {
        const isSelected = selectedNav === nav
        const isActivated =
          nav.spineIndex !== undefined && activeNavs.includes(nav)
        const textCls: string[] = ['text']
        if (isActivated) textCls.push('active')
        if (nav.href) textCls.push('clickable')
        if (isSelected) textCls.push('selected')
        return (
          <li key={idx} data-href={nav.href} data-spine-index={nav.spineIndex}>
            <div
              className="item"
              onClick={(event) => {
                eventBan(event)
                if (nav.href) player.gotoUrlPath(nav.href).catch(console.error)
              }}
            >
              <div className={textCls.join(' ')}>{nav.label}</div>
            </div>
            <NavList
              navs={nav.children}
              activeNavs={activeNavs}
              selectedNav={selectedNav}
              player={player}
            ></NavList>
          </li>
        )
      })}
    </ul>
  )
}

function NavTree({
  book,
  activeNavs,
  player,
}: {
  book: BookView
  activeNavs?: BookTypes.Nav[]
  player: Player
}) {
  const { addHotkeys } = useHotkeys()
  const refNav = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const selectedNav = useMemo(() => {
    return book.flattenedNavs[selectedIndex] as BookTypes.Nav | undefined
  }, [book.flattenedNavs, selectedIndex])

  // selected hotkeys
  useEffect(() => {
    const prevNav = () => {
      setSelectedIndex((idx) => (idx <= 0 ? 0 : idx - 1))
    }
    const nextNav = () => {
      setSelectedIndex((idx) =>
        idx >= book.flattenedNavs.length - 1
          ? book.flattenedNavs.length - 1
          : idx + 1,
      )
    }
    const gotoNav = () => {
      if (!selectedNav?.href) return
      player.gotoUrlPath(selectedNav.href).catch(console.error)
    }
    const speakNav = () => {
      if (!selectedNav) return
      player.utterer.speakText(selectedNav.label).catch(console.error)
    }

    return addHotkeys([
      ['p', t('hotkey.prevNav'), prevNav],
      ['n', t('hotkey.nextNav'), nextNav],
      ['enter', t('hotkey.gotoNav'), gotoNav],
      [{ shift: true, key: 'K' }, t('hotkey.speakNav'), speakNav],
    ])
  }, [addHotkeys, book.flattenedNavs, player, selectedNav])

  const lastActiveNav = useMemo(() => {
    return activeNavs?.at(-1)
  }, [activeNavs])

  // change selected nav item
  useLayoutEffect(() => {
    if (lastActiveNav === undefined) return
    const lastActiveNavIndex = book.flattenedNavs.indexOf(lastActiveNav)
    if (lastActiveNavIndex === -1) return
    setSelectedIndex(lastActiveNavIndex)
  }, [book.flattenedNavs, lastActiveNav])

  // scroll to selected nav
  useEffect(() => {
    if (!selectedNav) return
    const navDiv = refNav.current
    if (!navDiv) return
    const selectedNavDiv = navDiv.querySelector('div.text.selected')
    selectedNavDiv?.scrollIntoView({
      block: 'center',
    })
  }, [selectedNav])

  return (
    <div ref={refNav} className="panel-content book-nav">
      {book.navs.length ? (
        <NavList
          navs={book.navs}
          activeNavs={activeNavs ?? []}
          selectedNav={selectedNav}
          player={player}
        />
      ) : (
        t('desc.navEmpty')
      )}
    </div>
  )
}

export function useBookViewNav(
  book: BookView,
  player: Player,
  activeNavs?: BookTypes.Nav[],
) {
  return {
    NavTreeView: (
      <NavTree book={book} player={player} activeNavs={activeNavs}></NavTree>
    ),
  }
}
