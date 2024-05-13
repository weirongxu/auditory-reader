import { Delete, MoreVert, NoteAdd } from '@mui/icons-material'
import { Menu, MenuItem } from '@mui/material'
import { t } from 'i18next'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { booksAnnotationsRouter } from '../../../../../core/api/books/annotations.js'
import type { BookView } from '../../../../../core/book/book-base.js'
import type { BookTypes } from '../../../../../core/book/types.js'
import { useAction } from '../../../../../core/route/action.js'
import { isMobile } from '../../../../../core/util/browser.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { textEllispse } from '../../../../../core/util/text.js'
import { SwipeAction } from '../../../../common/swipe-action.js'
import { useHotkeys } from '../../../../hotkey/hotkey-state.js'
import type { Player } from '../player.js'
import { useAnnotationNoteDialog } from './annotations-dialogs.js'

function AnnotationItem({
  annotation,
  openNoteEdit,
  isSelected,
  isActived,
  player,
}: {
  annotation: BookTypes.PropertyAnnotation
  openNoteEdit: (
    annotation: BookTypes.PropertyAnnotation,
    player: Player,
  ) => void
  isSelected: boolean
  isActived: boolean
  player: Player
}) {
  const [anchorMenu, setAnchorMenu] = useState<HTMLDivElement | null>(null)

  const textCls: string[] = ['text', 'clickable']
  if (isActived) textCls.push('active')
  if (isSelected) textCls.push('selected')

  return (
    <li
      data-pos-section={annotation.pos.section}
      data-pos-paragraph={annotation.pos.paragraph}
    >
      <SwipeAction
        left={{
          node: <NoteAdd fontSize="small" />,
          width: 30,
          trigger: () => {
            openNoteEdit(annotation, player)
          },
        }}
        right={{
          node: <Delete fontSize="small" />,
          width: 30,
          trigger: () => {
            void player.annotations.remove(annotation)
          },
        }}
      >
        <div
          className="item"
          onContextMenu={(event) => {
            eventBan(event)
            // TODO
          }}
        >
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
              <div className="note">
                note: {textEllispse(annotation.note, 30)}
              </div>
            )}
          </div>
          {!isMobile && (
            <>
              <div
                className="btn"
                onClick={(event) => {
                  setAnchorMenu(event.currentTarget)
                }}
              >
                <MoreVert></MoreVert>
              </div>
              <Menu
                open={!!anchorMenu}
                anchorEl={anchorMenu}
                onClose={() => setAnchorMenu(null)}
              >
                <MenuItem
                  onClick={() => {
                    openNoteEdit(annotation, player)
                  }}
                >
                  <NoteAdd fontSize="small" />
                  {t('note')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    void player.annotations.remove(annotation)
                    setAnchorMenu(null)
                  }}
                >
                  <Delete fontSize="small" />
                  {t('remove')}
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
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
              isActived={activeAnnotationIndex === idx}
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
  selection: BookTypes.PropertyAnnotationRange | undefined,
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
        ? annotations?.at(activeAnnotationIndex)
        : undefined,
    [annotations, activeAnnotationIndex],
  )

  const closestAnnotation = useMemo(
    () =>
      closestAnnotationIndex !== null
        ? annotations?.at(closestAnnotationIndex)
        : undefined,
    [annotations, closestAnnotationIndex],
  )

  return {
    annotations,
    AnnotationView: (
      <Annotations
        annotations={annotations}
        closestAnnotationIndex={closestAnnotationIndex}
        activeAnnotationIndex={activeAnnotationIndex}
        player={player}
      ></Annotations>
    ),
    activeAnnotation,
    closestAnnotation,
  }
}
