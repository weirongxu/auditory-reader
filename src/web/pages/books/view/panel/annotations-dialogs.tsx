import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import { Button } from 'antd'
import { t } from 'i18next'
import { useCallback, useEffect, useState } from 'react'
import type { BookTypes } from '../../../../../core/book/types.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { FlexBox } from '../../../../components/flex-box.js'
import { Textarea } from '../../../../components/textarea.js'
import type { Player } from '../player.js'

export function useAnnotationNoteDialog({ player }: { player: Player }) {
  const [editAnnotation, setEditAnnotation] =
    useState<BookTypes.PropertyAnnotation | null>(null)
  const [note, setNote] = useState<string>()

  useEffect(() => {
    if (!editAnnotation) return
    setNote(editAnnotation.note)
  }, [editAnnotation])

  const onOk = useCallback(() => {
    if (editAnnotation)
      void player.annotations.upsert(
        {
          pos: editAnnotation.pos,
          range: editAnnotation.range,
          uuid: editAnnotation.uuid,
        },
        {
          color: editAnnotation.color,
          group: editAnnotation.group,
          note,
        },
      )
    setEditAnnotation(null)
  }, [editAnnotation, note, player.annotations])

  const onClose = useCallback(() => {
    setEditAnnotation(null)
  }, [])

  return {
    openNoteEdit: setEditAnnotation,
    NoteEditDialog: (
      <Dialog
        open={!!editAnnotation}
        onClose={onClose}
        fullWidth
        PaperProps={{
          style: {
            alignItems: 'start',
          },
        }}
      >
        <DialogTitle>
          {t('annotation')} {t('note')}
        </DialogTitle>
        <DialogContent style={{ width: '100%' }}>
          <Typography>{editAnnotation?.brief}</Typography>
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
              <Button type="primary" htmlType="submit">
                {t('update')}
              </Button>
            </FlexBox>
          </form>
        </DialogContent>
      </Dialog>
    ),
  }
}
