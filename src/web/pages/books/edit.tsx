import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { booksShowRouter } from '../../../core/api/books/show.js'
import { booksUpdateRouter } from '../../../core/api/books/update.js'
import type { BookTypes } from '../../../core/book/types.js'
import { useOrderedLangOptions, type LangCode } from '../../../core/lang.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { FlexBox } from '../../components/flex-box.js'
import { useHotkeys } from '../../hotkey/hotkey-state.js'
import { NotFound } from '../not-found.js'
import { eventBan } from '../../../core/util/dom.js'

function UpdateForm({ book }: { book: BookTypes.Entity }) {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>(book.name)
  const [langCode, setLangCode] = useState<LangCode>(book.langCode)
  const { addHotkeys } = useHotkeys()

  // hotkey
  useEffect(() => {
    return addHotkeys([['u', t('hotkey.goBack'), () => nav('../../')]])
  }, [addHotkeys, nav])

  return (
    <form
      style={{
        margin: '20px auto 0',
        width: '800px',
      }}
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
          nav('/books')
        })
      }}
    >
      <FlexBox gap={8}>
        <TextField
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

function BookEditReq({ uuid }: { uuid: string }) {
  const { data: bookItem } = useAction(booksShowRouter, { uuid })

  if (!bookItem) return <CircularProgress></CircularProgress>

  return <UpdateForm book={bookItem}></UpdateForm>
}

export function BookEdit() {
  const { uuid } = useParams<{ uuid: string }>()

  if (!uuid) return <NotFound title="book"></NotFound>

  return <BookEditReq uuid={uuid}></BookEditReq>
}
