import {
  faEllipsisVertical,
  faNoteSticky,
  faSearch,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { Dropdown, Space } from 'antd'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { booksKeywordsRouter } from '../../../../../core/api/books/keywords.js'
import type { BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { SwipeAction } from '../../../../common/swipe-action.js'
import { Icon } from '../../../../components/icon.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import { useBookSearch } from '../book-search.js'
import type { Player } from '../player.js'
import { useKeywordDialog } from './keywords-dialogs.js'

function KeywordItem({
  keyword,
  openEdit,
  isSelected,
  player,
}: {
  keyword: BookTypes.PropertyKeyword
  openEdit: (keyword: BookTypes.PropertyKeyword, player: Player) => void
  isSelected: boolean
  player: Player
}) {
  const bookSearch = useBookSearch()
  const textCls: string[] = ['text', 'clickable']
  if (isSelected) textCls.push('selected')

  const menuItems = [
    {
      key: 'note',
      icon: <Icon icon={faNoteSticky} size="sm" />,
      label: t('note'),
      onClick: () => {
        openEdit(keyword, player)
      },
    },
    {
      key: 'remove',
      icon: <Icon icon={faTrash} size="sm" />,
      label: t('remove'),
      onClick: () => {
        void player.keywords.remove(keyword)
      },
    },
    {
      key: 'search',
      icon: <Icon icon={faSearch} size="sm" />,
      label: t('search'),
      onClick: () => {
        void bookSearch(keyword.keyword)
      },
    },
  ]

  return (
    <li>
      <SwipeAction
        left={{
          node: <Icon icon={faNoteSticky} size="sm" />,
          width: 30,
          trigger: () => {
            openEdit(keyword, player)
          },
        }}
        right={{
          node: <Icon icon={faTrash} size="sm" />,
          width: 30,
          trigger: () => {
            void player.keywords.remove(keyword)
          },
        }}
      >
        <Dropdown
          menu={{
            items: menuItems,
          }}
          trigger={['contextMenu']}
        >
          <div className="item">
            <div
              className={textCls.join(' ')}
              style={{ fontSize: 13 }}
              onClick={(event) => {
                eventBan(event)
                player
                  .gotoSection(keyword.pos.section, keyword.pos.paragraph)
                  .catch(console.error)
              }}
            >
              {keyword.keyword}
              {keyword.alias && (
                <div className="alias">
                  <Space wrap>
                    {keyword.alias.map((a, i) => (
                      <span key={i} className="selected-text">
                        {a}
                      </span>
                    ))}
                  </Space>
                </div>
              )}
              <div className="range">
                <span className="selected-text">{keyword.brief}</span>
              </div>
              {keyword.note && <div className="note">note: {keyword.note}</div>}
            </div>
            <div className="btn">
              <Dropdown
                menu={{
                  items: menuItems,
                }}
              >
                <div>
                  <Icon
                    icon={faEllipsisVertical}
                    style={{
                      paddingLeft: '8px',
                      paddingRight: '8px',
                    }}
                  />
                </div>
              </Dropdown>
            </div>
          </div>
        </Dropdown>
      </SwipeAction>
    </li>
  )
}

function Keywords({
  keywords,
  player,
}: {
  keywords: BookTypes.PropertyKeyword[] | undefined | null
  player: Player
}) {
  const { addHotkeys } = useHotkeys()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const refKeyword = useRef<HTMLDivElement>(null)

  const { openEdit, EditDialog } = useKeywordDialog({ player })

  const selectedKeyword = useMemo(() => {
    return keywords?.at(selectedIndex)
  }, [keywords, selectedIndex])

  const removeSelectedKeyword = useCallback(async () => {
    if (selectedKeyword) await player.keywords.remove(selectedKeyword)
  }, [player.keywords, selectedKeyword])

  // selected hotkeys
  useEffect(() => {
    const prevKeyword = () => {
      setSelectedIndex((idx) => (idx <= 0 ? 0 : idx - 1))
    }
    const nextKeyword = () => {
      keywords &&
        setSelectedIndex((idx) =>
          idx >= keywords.length - 1 ? keywords.length - 1 : idx + 1,
        )
    }
    const gotoKeyword = () => {
      const selectedKeyword = keywords?.[selectedIndex]
      if (!selectedKeyword) return
      player
        .gotoSection(selectedKeyword.pos.section, selectedKeyword.pos.paragraph)
        .catch(console.error)
    }
    const speakKeyword = () => {
      if (!selectedKeyword) return
      player.utterer.speakText(selectedKeyword.keyword).catch(console.error)
    }

    return addHotkeys([
      ['p', t('hotkey.prevKeyword'), prevKeyword],
      ['n', t('hotkey.nextKeyword'), nextKeyword],
      ['enter', t('hotkey.gotoKeyword'), gotoKeyword],
      [
        ['d', 'b'],
        t('hotkey.keywordRemoveSelected'),
        () => removeSelectedKeyword(),
      ],
      [
        ['g', 'n'],
        t('hotkey.keywordNote'),
        () => openEdit(selectedKeyword ?? null),
      ],
      [{ shift: true, key: 'K' }, t('hotkey.speakKeyword'), speakKeyword],
    ])
  }, [
    addHotkeys,
    keywords,
    openEdit,
    player,
    removeSelectedKeyword,
    selectedKeyword,
    selectedIndex,
  ])

  // scroll to selected keyword
  useEffect(() => {
    if (!selectedKeyword) return
    const keywordDiv = refKeyword.current
    if (!keywordDiv) return
    const selectedKeywordDiv = keywordDiv.querySelector('div.text.selected')
    selectedKeywordDiv?.scrollIntoView({
      block: 'center',
    })
  }, [selectedKeyword])

  return (
    <div className="panel-content book-keywords" ref={refKeyword}>
      {!keywords?.length ? (
        t('desc.keywordsEmpty')
      ) : (
        <ul>
          {keywords.map((keyword, idx) => (
            <KeywordItem
              key={idx}
              keyword={keyword}
              openEdit={openEdit}
              isSelected={selectedIndex === idx}
              player={player}
            ></KeywordItem>
          ))}
        </ul>
      )}
      {EditDialog}
    </div>
  )
}

export function useBookViewKeywords(book: BookView, player: Player) {
  const uuid = book.item.uuid

  const { data: keywords, reload } = useAction(
    booksKeywordsRouter,
    {
      uuid,
    },
    {
      clearWhenReload: false,
    },
  )

  useEffect(() => {
    player.keywords.reload = reload
    return () => {
      player.keywords.reload = undefined
    }
  }, [player.keywords, reload])

  return {
    keywords: keywords?.items,
    KeywordView: (
      <Keywords keywords={keywords?.items} player={player}></Keywords>
    ),
  }
}
