import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { t } from 'i18next'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import type { BookTypes } from '../../../../core/book/types.js'
import { eventBan } from '../../../../core/util/dom.js'
import { useConfirmHotkey } from '../../../common/confirm.js'
import { FlexBox } from '../../../components/flex-box.js'
import { Textarea } from '../../../components/textarea.js'
import type { Player } from './player.js'

const bookmarkNoteOpenAtom = atom(false)

export const useBookmarkNoteDialog = () => {
  const [, setOpen] = useAtom(bookmarkNoteOpenAtom)
  return useCallback(() => setOpen(true), [setOpen])
}

function BookmarkNoteDialog({
  player,
  activeBookmark,
}: {
  player: Player
  activeBookmark: BookTypes.PropertyBookmark | undefined
}) {
  const [open, setOpen] = useAtom(bookmarkNoteOpenAtom)
  const [note, setNote] = useState<string>()

  const onOk = useCallback(() => {
    if (activeBookmark)
      void player.bookmarks.updateBookmark({
        ...activeBookmark,
        note,
      })
    setOpen(false)
  }, [activeBookmark, note, player.bookmarks, setOpen])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        style: {
          alignItems: 'start',
        },
      }}
    >
      <DialogTitle>
        {t('bookmark')} {t('note')}
      </DialogTitle>
      <DialogContent style={{ width: '100%' }}>
        <Typography>{activeBookmark?.brief}</Typography>
        <form
          onSubmit={(e) => {
            eventBan(e)
            void onOk()
          }}
        >
          <FlexBox gap={8}>
            <Textarea
              label={t('note')}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></Textarea>
            <Button type="submit">{t('update')}</Button>
          </FlexBox>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const bookmarkRangeNoteOpenAtom = atom(false)

export const useBookmarkRangeNoteDialog = () => {
  const [, setOpen] = useAtom(bookmarkRangeNoteOpenAtom)
  return useCallback(() => setOpen(true), [setOpen])
}

function BookmarkRangeNoteDialog({
  player,
  pos,
  selection,
  activeBookmark,
  activeBookmarkRange,
}: {
  player: Player
  pos: BookTypes.PropertyPosition
  selection: BookTypes.PropertyBookmarkRange
  activeBookmark: BookTypes.PropertyBookmark | undefined
  activeBookmarkRange: BookTypes.PropertyBookmarkRange | undefined
}) {
  const [open, setOpen] = useAtom(bookmarkRangeNoteOpenAtom)
  const [note, setNote] = useState<string>()

  useEffect(() => {
    setNote(activeBookmarkRange?.note)
  }, [activeBookmarkRange?.note])

  const onOk = useCallback(() => {
    void player.bookmarks.syncBookmarkWithRange(
      pos,
      activeBookmark,
      selection,
      note,
    )
    setOpen(false)
  }, [activeBookmark, note, player.bookmarks, pos, selection, setOpen])

  const onClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  useConfirmHotkey({
    enable: open,
    onOk,
    onClose,
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{t('bookmark')}</DialogTitle>
      <DialogContent>
        <FlexBox dir="row" gap={8}>
          <label>{t('select')}:</label>
          <strong>{selection.selectedText}</strong>
        </FlexBox>
        <form
          onSubmit={(e) => {
            eventBan(e)
            onOk()
          }}
        >
          <FlexBox gap={8}>
            <Textarea
              label={t('note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></Textarea>
            <Button type="submit">
              {activeBookmarkRange ? t('update') : t('add')}
            </Button>
          </FlexBox>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function BookmarkDialogs({
  player,
  pos,
  selection,
  activeBookmark,
  activeBookmarkRange,
}: {
  player: Player
  pos: BookTypes.PropertyPosition
  selection: BookTypes.PropertyBookmarkRange | undefined
  activeBookmark: BookTypes.PropertyBookmark | undefined
  activeBookmarkRange: BookTypes.PropertyBookmarkRange | undefined
}) {
  return (
    <>
      <BookmarkNoteDialog player={player} activeBookmark={activeBookmark} />
      {selection && (
        <BookmarkRangeNoteDialog
          player={player}
          pos={pos}
          selection={selection}
          activeBookmark={activeBookmark}
          activeBookmarkRange={activeBookmarkRange}
        />
      )}
    </>
  )
}
