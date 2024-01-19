import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useSyncedRef } from '@react-hookz/web'
import { t } from 'i18next'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { booksShowRouter } from '../../../core/api/books/show.js'
import { booksUpdateRouter } from '../../../core/api/books/update.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useOrderedLangOptions, type LangCode } from '../../../core/lang.js'
import { useAction } from '../../../core/route/action.js'
import { eventBan } from '../../../core/util/dom.js'
import { async } from '../../../core/util/promise.js'
import { FlexBox } from '../../components/flex-box.js'

function UpdateForm({
  book,
  reload,
}: {
  book: BookTypes.Entity
  reload: () => void
}) {
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>(book.name)
  const [langCode, setLangCode] = useState<LangCode>(book.langCode)

  return (
    <form
      onSubmit={(e) => {
        eventBan(e)
        async(async () => {
          await booksUpdateRouter.action({
            uuid: book.uuid,
            update: {
              name,
              langCode,
            },
          })
          reload()
        })
      }}
    >
      <FlexBox gap={8}>
        <TextField
          autoFocus
          required
          label={t('bookName')}
          placeholder={t('prompt.inputBookName')}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
        ></TextField>

        <Autocomplete
          placeholder={t('prompt.selectLanguage')}
          options={langOptions}
          value={langOptions.find((l) => l.value === langCode)}
          onChange={(_, value) => {
            if (value?.value) setLangCode(value.value)
          }}
          renderInput={(params) => (
            <TextField {...params} label={t('language')} required />
          )}
        ></Autocomplete>

        <Button fullWidth type="submit">
          {t('update')}
        </Button>
      </FlexBox>
    </form>
  )
}

function BookEditReq({ uuid, reload }: { uuid: string; reload: () => void }) {
  const { data: bookItem } = useAction(booksShowRouter, { uuid })

  if (!bookItem) return <CircularProgress></CircularProgress>

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
    <Dialog open={!!bookEditDialog.uuid} onClose={onClose} fullWidth>
      <DialogTitle>{t('editBook')}</DialogTitle>
      <DialogContent>
        {bookEditDialog.uuid && (
          <BookEditReq
            uuid={bookEditDialog.uuid}
            reload={() => {
              onClose()
              bookEditDialog.reloads.forEach((r) => r())
            }}
          ></BookEditReq>
        )}
      </DialogContent>
    </Dialog>
  )
}
