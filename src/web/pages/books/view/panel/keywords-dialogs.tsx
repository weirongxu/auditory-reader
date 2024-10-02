import { Button, Form, Modal, Typography } from 'antd'
import { t } from 'i18next'
import { useCallback, useEffect, useState } from 'react'
import type { BookTypes } from '../../../../../core/book/types.js'
import { eventBan } from '../../../../../core/util/dom.js'
import { FlexBox } from '../../../../components/flex-box.js'
import { Textarea } from '../../../../components/textarea.js'
import type { Player } from '../player.js'

export function useKeywordDialog({ player }: { player: Player }) {
  const [editKeyword, setEditKeyword] =
    useState<BookTypes.PropertyKeyword | null>(null)
  const [alias, setAlias] = useState<string>()
  const [note, setNote] = useState<string>()

  useEffect(() => {
    if (!editKeyword) return
    setAlias(editKeyword.alias?.join('\n'))
    setNote(editKeyword.note)
  }, [editKeyword])

  const onOk = useCallback(() => {
    if (editKeyword)
      void player.keywords.upsert(
        {
          pos: editKeyword.pos,
          uuid: editKeyword.uuid,
          keyword: editKeyword.keyword,
        },
        {
          color: editKeyword.color,
          note,
          alias: alias
            ?.split('\n')
            .map((a) => a.trim())
            .filter((a) => a),
        },
      )
    setEditKeyword(null)
  }, [alias, editKeyword, note, player.keywords])

  const onClose = useCallback(() => {
    setEditKeyword(null)
  }, [])

  return {
    openEdit: setEditKeyword,
    EditDialog: (
      <Modal
        open={!!editKeyword}
        onCancel={onClose}
        footer={false}
        title={`${t('keyword')} ${t('note')}`}
      >
        <Typography>{editKeyword?.keyword}</Typography>
        <form
          onSubmit={(e) => {
            eventBan(e)
            void onOk()
          }}
        >
          <Form.Item label={t('alias')}>
            <FlexBox gap={8}>
              <Textarea
                autoFocus
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              ></Textarea>
            </FlexBox>
          </Form.Item>
          <Form.Item label={t('note')}>
            <FlexBox gap={8}>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></Textarea>
            </FlexBox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t('update')}
            </Button>
          </Form.Item>
        </form>
      </Modal>
    ),
  }
}
