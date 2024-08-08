import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMountEffect } from '@react-hookz/web'
import { Alert, Button, Drawer, Input, type InputRef } from 'antd'
import { t } from 'i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  booksSearchRouter,
  type BookSearchMatch,
  type BookSearchResponse,
} from '../../../../core/api/books/search.js'
import { eventBan } from '../../../../core/util/dom.js'
import { FlexBox } from '../../../components/flex-box.js'
import { useKeyEscape } from '../../../hooks/use-escape.js'
import { useHotkeys } from '../../../hotkey/hotkey-state.js'
import { useBookContext } from '../view.context.js'
import * as styles from './book-search.module.scss'
import type { Player } from './player.js'

function BookSearchResult({
  player,
  searchResponse,
}: {
  player: Player
  searchResponse: BookSearchResponse | null
}) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const refSearchResult = useRef<HTMLDivElement>(null)

  const gotoMatch = useCallback(
    async (match: BookSearchMatch) => {
      await player.gotoPos({
        section: match.section,
        paragraph: match.paragraph,
      })
    },
    [player],
  )

  // scroll to selected
  useEffect(() => {
    if (selectedIndex < 0) return
    const resultDiv = refSearchResult.current
    if (!resultDiv) return
    const selectedDiv = resultDiv.querySelector('li.text.selected')
    selectedDiv?.scrollIntoView({
      block: 'center',
    })
  }, [selectedIndex])

  const { addHotkeys } = useHotkeys()

  useEffect(() => {
    if (!searchResponse) return
    const matches = searchResponse.matches

    const prevSearch = () => {
      setSelectedIndex((idx) => (idx <= 0 ? 0 : idx - 1))
    }

    const nextSearch = () => {
      setSelectedIndex((idx) =>
        idx >= matches.length - 1 ? matches.length - 1 : idx + 1,
      )
    }

    const gotoSearch = async () => {
      const match = matches.at(selectedIndex)
      if (match) await gotoMatch(match)
    }

    return addHotkeys(
      [
        ['p', t('hotkey.prevSearchResult'), prevSearch],
        ['n', t('hotkey.nextSearchResult'), nextSearch],
        ['enter', t('hotkey.gotoSearchResult'), gotoSearch],
      ],
      { level: 2 },
    )
  }, [addHotkeys, gotoMatch, searchResponse, selectedIndex])

  if (!searchResponse) return null
  if (searchResponse.matches.length === 0)
    return <Alert type="warning" message={t('prompt.noSearchMatches')}></Alert>
  const searchLength = searchResponse.search.length
  return (
    <div className={styles.bookSearchResult} ref={refSearchResult}>
      <ul>
        {searchResponse.matches.map((match, i) => {
          const isSelected = i === selectedIndex
          const textCls: string[] = ['text', 'clickable']
          if (isSelected) textCls.push('selected')
          const firstText = match.text.slice(0, match.start)
          const lastText = match.text.slice(match.start + searchLength)
          return (
            <li
              className={textCls.join(' ')}
              key={i}
              onClick={() => {
                void gotoMatch(match)
                setSelectedIndex(i)
              }}
            >
              {match.nav && <strong>{match.nav}</strong>}
              <div>
                {firstText}
                <span className="highlight">{searchResponse.search}</span>
                {lastText}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="stats">
        {selectedIndex + 1} / {searchResponse.matches.length}
      </div>
    </div>
  )
}

function BookSearchView({
  refSearchInput,
  player,
}: {
  refSearchInput: React.MutableRefObject<InputRef | null>
  player: Player
}) {
  const { uuid } = useBookContext()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResponse, setSearchResponse] =
    useState<BookSearchResponse | null>(null)

  const triggerSearch = useCallback(async () => {
    if (loading) return
    setSearchResponse(null)
    setLoading(true)
    const res = await booksSearchRouter.action({ uuid, search })
    setSearchResponse(res)
    setLoading(false)
    refSearchInput.current?.blur()
  }, [loading, refSearchInput, search, uuid])

  useMountEffect(() => {
    setTimeout(() => {
      if (refSearchInput.current) {
        refSearchInput.current.focus()
      }
    }, 100)
  })

  return (
    <FlexBox style={{ width: '100%', height: '100%' }} gap={8}>
      <FlexBox dir="row" gap={8}>
        <Input
          className="flex-1"
          ref={refSearchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              eventBan(e)
              refSearchInput.current?.blur()
            } else if (e.key === 'Enter') {
              void triggerSearch()
            }
          }}
        ></Input>
        <Button
          onClick={() => {
            void triggerSearch()
          }}
          loading={loading}
        >
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </FlexBox>
      <BookSearchResult player={player} searchResponse={searchResponse} />
    </FlexBox>
  )
}

export function BookSearchButton({ player }: { player: Player }) {
  const [open, setOpen] = useState(false)
  const refSearchInput = useRef<InputRef | null>(null)
  const openSearch = useCallback(() => {
    setOpen(true)
    setTimeout(() => {
      refSearchInput.current?.focus()
    }, 100)
  }, [])

  const { addHotkeys } = useHotkeys()
  useEffect(() => {
    return addHotkeys([['/', t('search'), openSearch]], {
      level: 2,
    })
  }, [addHotkeys, openSearch])

  useKeyEscape(
    () => {
      setOpen(false)
    },
    { enable: open },
  )

  return (
    <>
      <Button
        block
        type="primary"
        icon={<FontAwesomeIcon icon={faSearch} />}
        onClick={() => {
          openSearch()
        }}
      >
        {t('search')}
      </Button>
      <Drawer
        forceRender
        title={t('search')}
        open={open}
        onClose={() => setOpen(false)}
      >
        <BookSearchView refSearchInput={refSearchInput} player={player} />
      </Drawer>
    </>
  )
}
