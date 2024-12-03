import {
  faEllipsisVertical,
  faNoteSticky,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { Dropdown } from 'antd'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { booksAnnotationsRouter } from '../../../../../core/api/books/annotations.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { isMobile } from '../../../../../core/util/browser.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { SwipeAction } from '../../../../common/swipe-action.js'
import { Icon } from '../../../../components/icon.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import type { BookView } from '../../view.js'
import type { Player } from '../player.js'
import { useAnnotationNoteDialog } from './annotations-dialogs.js'

function AnnotationItem({
  annotation,
  openNoteEdit,
  isSelected,
  isActivated,
  player,
}: {
  annotation: BookTypes.PropertyAnnotation
  openNoteEdit: (
    annotation: BookTypes.PropertyAnnotation,
    player: Player,
  ) => void
  isSelected: boolean
  isActivated: boolean
  player: Player
}) {
  const textCls: string[] = ['text', 'clickable']
  if (isActivated) textCls.push('active')
  if (isSelected) textCls.push('selected')

  const menuItems = [
    {
      key: 'note',
      icon: <Icon icon={faNoteSticky} size="sm" />,
      label: t('note'),
      onClick: () => {
        openNoteEdit(annotation, player)
      },
    },
    {
      key: 'remove',
      icon: <Icon icon={faTrash} size="sm" />,
      label: t('remove'),
      onClick: () => {
        void player.annotations.remove(annotation)
      },
    },
  ]

  return (
    <li
      data-pos-section={annotation.pos.section}
      data-pos-paragraph={annotation.pos.paragraph}
    >
      <SwipeAction
        left={{
          node: <Icon icon={faNoteSticky} size="sm" />,
          width: 30,
          trigger: () => {
            openNoteEdit(annotation, player)
          },
        }}
        right={{
          node: <Icon icon={faTrash} size="sm" />,
          width: 30,
          trigger: () => {
            void player.annotations.remove(annotation)
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
                  .gotoSection(annotation.pos.section, annotation.pos.paragraph)
                  .catch(console.error)
              }}
            >
              {annotation.brief}
              {annotation.range && (
                <div className="range">
                  <span className="selected-text">
                    {annotation.range.selectedText}
                  </span>
                </div>
              )}
              {annotation.note && (
                <div className="note">note: {annotation.note}</div>
              )}
            </div>
            {!isMobile && (
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
            )}
          </div>
        </Dropdown>
      </SwipeAction>
    </li>
  )
}

function Annotations({
  annotations,
  activeAnnotationIndex,
  closestAnnotationIndex,
  player,
}: {
  annotations: BookTypes.PropertyAnnotation[] | undefined | null
  activeAnnotationIndex: number | null
  closestAnnotationIndex: number | null
  player: Player
}) {
  const { addHotkeys } = useHotkeys()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const refAnnotation = useRef<HTMLDivElement>(null)

  const { openNoteEdit, NoteEditDialog } = useAnnotationNoteDialog({ player })

  const selectedAnnotation = useMemo(() => {
    return annotations?.at(selectedIndex)
  }, [annotations, selectedIndex])

  const removeSelectedAnnotation = useCallback(async () => {
    if (selectedAnnotation) await player.annotations.remove(selectedAnnotation)
  }, [player.annotations, selectedAnnotation])

  // selected hotkeys
  useEffect(() => {
    const prevAnnotation = () => {
      setSelectedIndex((idx) => (idx <= 0 ? 0 : idx - 1))
    }
    const nextAnnotation = () => {
      annotations &&
        setSelectedIndex((idx) =>
          idx >= annotations.length - 1 ? annotations.length - 1 : idx + 1,
        )
    }
    const gotoAnnotation = () => {
      const selectedAnnotation = annotations?.[selectedIndex]
      if (!selectedAnnotation) return
      player
        .gotoSection(
          selectedAnnotation.pos.section,
          selectedAnnotation.pos.paragraph,
        )
        .catch(console.error)
    }
    const speakAnnotation = () => {
      if (!selectedAnnotation) return
      player.utterer.speakText(selectedAnnotation.brief).catch(console.error)
    }

    return addHotkeys([
      ['p', t('hotkey.prevAnnotation'), prevAnnotation],
      ['n', t('hotkey.nextAnnotation'), nextAnnotation],
      ['enter', t('hotkey.gotoAnnotation'), gotoAnnotation],
      [
        ['d', 'b'],
        t('hotkey.annotationRemoveSelected'),
        () => removeSelectedAnnotation(),
      ],
      [
        ['g', 'n'],
        t('hotkey.annotationNote'),
        () => openNoteEdit(selectedAnnotation ?? null),
      ],
      [{ shift: true, key: 'K' }, t('hotkey.speakAnnotation'), speakAnnotation],
    ])
  }, [
    addHotkeys,
    annotations,
    openNoteEdit,
    player,
    removeSelectedAnnotation,
    selectedAnnotation,
    selectedIndex,
  ])

  // change selected annotation
  useEffect(() => {
    if (closestAnnotationIndex === null) return
    setSelectedIndex(closestAnnotationIndex)
  }, [closestAnnotationIndex])

  // scroll to selected annotation
  useEffect(() => {
    if (!selectedAnnotation) return
    const annotationDiv = refAnnotation.current
    if (!annotationDiv) return
    const selectedAnnotationDiv =
      annotationDiv.querySelector('div.text.selected')
    selectedAnnotationDiv?.scrollIntoView({
      block: 'center',
    })
  }, [selectedAnnotation])

  return (
    <div className="panel-content book-annotations" ref={refAnnotation}>
      {!annotations?.length ? (
        t('desc.annotationsEmpty')
      ) : (
        <ul>
          {annotations.map((annotation, idx) => (
            <AnnotationItem
              key={idx}
              annotation={annotation}
              openNoteEdit={openNoteEdit}
              isActivated={activeAnnotationIndex === idx}
              isSelected={selectedIndex === idx}
              player={player}
            ></AnnotationItem>
          ))}
        </ul>
      )}
      {NoteEditDialog}
    </div>
  )
}

export function useBookViewAnnotations(
  book: BookView,
  player: Player,
  pos: BookTypes.PropertyPosition,
  selection: BookTypes.PropertyRange | undefined,
) {
  const uuid = book.item.uuid

  const { data: annotations, reload } = useAction(
    booksAnnotationsRouter,
    {
      uuid,
    },
    {
      clearWhenReload: false,
    },
  )

  useEffect(() => {
    player.annotations.reload = reload
    return () => {
      player.annotations.reload = undefined
    }
  }, [player.annotations, reload])

  const activeAnnotationIndex = useMemo(() => {
    return player.annotations.indexByPos(pos, selection ?? null)
  }, [player.annotations, pos, selection])

  const closestAnnotationIndex = useMemo(() => {
    return player.annotations.closestIndexByPos(pos)
  }, [player.annotations, pos])

  const activeAnnotation = useMemo(
    () =>
      activeAnnotationIndex !== null
        ? annotations?.items.at(activeAnnotationIndex)
        : undefined,
    [annotations, activeAnnotationIndex],
  )

  const closestAnnotation = useMemo(
    () =>
      closestAnnotationIndex !== null
        ? annotations?.items.at(closestAnnotationIndex)
        : undefined,
    [annotations, closestAnnotationIndex],
  )

  return {
    annotations: annotations?.items,
    AnnotationView: (
      <Annotations
        annotations={annotations?.items}
        closestAnnotationIndex={closestAnnotationIndex}
        activeAnnotationIndex={activeAnnotationIndex}
        player={player}
      ></Annotations>
    ),
    closestAnnotation,
  }
}
