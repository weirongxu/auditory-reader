import { Autocomplete, Button, TextField } from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../../core/api/books/create.js'
import { useOrderedLangOptions, type LangCode } from '../../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../../core/util/converter.js'
import { async } from '../../../../core/util/promise.js'
import { splitLines } from '../../../../core/util/text.js'
import { FlexBox } from '../../../components/flex-box.js'
import { eventBan } from '../../../../core/util/dom.js'

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
        eventBan(e)
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
      <FlexBox gap={8}>
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
          options={langOptions}
          value={langOptions.find((l) => l.value === langCode) ?? null}
          onChange={(_, value) => {
            if (value?.value) setLangCode(value.value)
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t('prompt.selectLanguage')}
              label={t('language')}
              required
            />
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
            const content = e.target.value
            if (!content) return
            if (!name) {
              const lines = splitLines(content)
              const newName = lines.find((line) => !!line.trim())
              if (newName) setName(newName)
            }
            setContent(content)
          }}
        ></TextField>

        <Button fullWidth type="submit">
          {t('add')}
        </Button>
      </FlexBox>
    </form>
  )
}
