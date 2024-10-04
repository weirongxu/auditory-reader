import { useSyncedRef } from '@react-hookz/web'
import { Button, Form, Input, Modal } from 'antd'
import { t } from 'i18next'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { booksShowRouter } from '../../../core/api/books/show.js'
import { booksUpdateRouter } from '../../../core/api/books/update.js'
import type { BookTypes } from '../../../core/book/types.js'
import { type LangCode } from '../../../core/lang.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { LanguageSelect } from '../../components/language-select.js'
import { SpinCenter } from '../../components/spin.js'

type Values = {
  name: string
  langCode: LangCode
}

function UpdateForm({
  book,
  reload,
}: {
  book: BookTypes.Entity
  reload: () => void
}) {
  const [form] = Form.useForm<Values>()

  return (
    <Form
      form={form}
      initialValues={{
        name: book.name,
        langCode: book.langCode,
      }}
      onFinish={(values) => {
        async(async () => {
          await booksUpdateRouter.json({
            uuid: book.uuid,
            update: {
              name: values.name,
              langCode: values.langCode,
            },
          })
          reload()
        })
      }}
    >
      <Form.Item label={t('bookName')} name="name" rules={[{ required: true }]}>
        <Input autoFocus placeholder={t('prompt.inputBookName')}></Input>
      </Form.Item>
      <Form.Item
        label={t('language')}
        name="langCode"
        rules={[{ required: true }]}
      >
        <LanguageSelect />
      </Form.Item>
      <Form.Item>
        <Button block htmlType="submit" type="primary">
          {t('update')}
        </Button>
      </Form.Item>
    </Form>
  )
}

function BookEditReq({ uuid, reload }: { uuid: string; reload: () => void }) {
  const { data: bookItem } = useAction(booksShowRouter, { uuid })

  if (!bookItem) return <SpinCenter></SpinCenter>

  return <UpdateForm book={bookItem} reload={reload}></UpdateForm>
}

const bookEditDialogAtom = atom<{
  uuid: string | null
  reloads: (() => void)[]
}>({ uuid: null, reloads: [] })

export function useBookEditDialog(reload: () => void) {
  const reloadRef = useSyncedRef(reload)
  const [, setBookEditDialog] = useAtom(bookEditDialogAtom)

  const openBookEdit = useCallback(
    (uuid: string) => {
      setBookEditDialog((s) => ({ ...s, uuid }))
    },
    [setBookEditDialog],
  )

  useEffect(() => {
    const reloadHook = () => {
      reloadRef.current()
    }
    setBookEditDialog((s) => ({ ...s, reloads: [...s.reloads, reloadHook] }))
    return () => {
      setBookEditDialog((s) => ({
        ...s,
        reloads: s.reloads.filter((r) => r !== reloadHook),
      }))
    }
  }, [reloadRef, setBookEditDialog])

  return { openBookEdit }
}

export function BookEditDialog() {
  const [bookEditDialog, setBookEditDialog] = useAtom(bookEditDialogAtom)
  const onClose = useCallback(() => {
    setBookEditDialog((s) => ({ ...s, uuid: null }))
  }, [setBookEditDialog])

  return (
    <Modal
      open={!!bookEditDialog.uuid}
      onCancel={onClose}
      title={t('editBook')}
      footer={false}
    >
      {bookEditDialog.uuid && (
        <BookEditReq
          uuid={bookEditDialog.uuid}
          reload={() => {
            onClose()
            bookEditDialog.reloads.forEach((r) => r())
          }}
        ></BookEditReq>
      )}
    </Modal>
  )
}
