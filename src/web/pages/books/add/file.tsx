import { Autocomplete, Button, FormControl, TextField } from '@mui/material'
import { t } from 'i18next'
import path from 'path'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../../core/api/books/create.js'
import { BookEpub } from '../../../../core/book/book-epub.js'
import {
  parseLangCode,
  useOrderedLangOptions,
  type LangCode,
} from '../../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../../core/util/converter.js'
import { async } from '../../../../core/util/promise.js'
import { FlexBox } from '../../../components/flex-box.js'
import { InputFile } from '../../../components/input-file.js'

export function AddFile() {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>()
  const [langCode, setLangCode] = useState<LangCode>()
  const [file, setFile] = useState<File>()

  return (
    <form
      style={{
        margin: '20px auto 0',
        maxWidth: '800px',
      }}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        async(async () => {
          if (!name) return
          if (!file) return
          if (!langCode) return
          if (file.name.endsWith('.epub')) {
            const buf = await file.arrayBuffer()
            const fileBase64 = arrayBufferToBase64(buf)
            const entity = await booksCreateRouter.action({
              name,
              langCode,
              bufferBase64: fileBase64,
              type: 'epub',
            })
            nav(`/books/added-successful/${entity.uuid}`)
          } else if (file.name.endsWith('.txt')) {
            const buf = await file.arrayBuffer()
            const fileBase64 = arrayBufferToBase64(buf)
            const entity = await booksCreateRouter.action({
              name,
              langCode,
              bufferBase64: fileBase64,
              type: 'text',
            })
            nav(`/books/added-successful/${entity.uuid}`)
          }
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
          placeholder={t('prompt.selectLanguage')}
          options={langOptions}
          value={langOptions.find((l) => l.value === langCode) ?? null}
          onChange={(_, value) => {
            if (!value?.value) return
            setLangCode(value.value)
          }}
          renderInput={(params) => (
            <TextField {...params} label={t('language')} required />
          )}
        ></Autocomplete>

        <FormControl>
          <InputFile
            onChange={([file]) => {
              if (!file) return
              async(async () => {
                if (file.name.endsWith('.epub')) {
                  const buf = await file.arrayBuffer()
                  const epub = await BookEpub.read(buf)
                  if (!epub) return
                  const ext = path.extname(file.name)
                  const basename = path.basename(file.name, ext)
                  setName(epub?.title ?? basename)
                  const langCode = parseLangCode(epub?.language)
                  if (langCode) {
                    setLangCode(langCode)
                  }
                }
                setFile(file)
              })
            }}
            prompt={t('prompt.uploadBook')}
          ></InputFile>
        </FormControl>

        <Button fullWidth type="submit">
          {t('add')}
        </Button>
      </FlexBox>
    </form>
  )
}
