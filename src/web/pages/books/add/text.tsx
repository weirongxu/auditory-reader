import { Stack, TextField, Autocomplete, Button } from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../../core/api/books/create.js'
import { useOrderedLangOptions, type LangCode } from '../../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../../core/util/converter.js'
import { async } from '../../../../core/util/promise.js'

export function AddText() {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>()
  const [langCode, setLangCode] = useState<LangCode>()
  const [content, setContent] = useState<string>()

  return (
    <form
      style={{
        margin: '20px auto 0',
        maxWidth: '800px',
      }}
      onSubmit={(e) => {
        e.preventDefault()
        async(async () => {
          if (!name) return
          if (!content) return
          if (!langCode) return
          const buf = new TextEncoder().encode(content)
          const fileBase64 = arrayBufferToBase64(buf)
          const entity = await booksCreateRouter.action({
            name,
            langCode,
            bufferBase64: fileBase64,
            type: 'text',
          })
          nav(`/books/added-successful/${entity.uuid}`)
        })
      }}
    >
      <Stack spacing={2}>
        <TextField
          required
          label={t('bookName')}
          placeholder={t('prompt.inputBookName')}
          value={name ?? ''}
          onChange={(e) => {
            setName(e.target.value)
          }}
        ></TextField>

        <Autocomplete
          placeholder={t('prompt.selectLanguage')}
          options={langOptions}
          value={langOptions.find((l) => l.value === langCode) ?? null}
          onChange={(_, value) => {
            if (value?.value) setLangCode(value.value)
          }}
          renderInput={(params) => (
            <TextField {...params} label={t('language')} required />
          )}
        ></Autocomplete>

        <TextField
          required
          multiline
          rows={6}
          variant="outlined"
          label={t('bookContent')}
          value={content ?? ''}
          onChange={(e) => {
            setContent(e.target.value)
          }}
        ></TextField>

        <Button fullWidth type="submit">
          {t('add')}
        </Button>
      </Stack>
    </form>
  )
}
