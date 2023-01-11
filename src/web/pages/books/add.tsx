import {
  Autocomplete,
  Button,
  FormControl,
  Stack,
  Tab,
  Tabs,
  TextField,
} from '@mui/material'
import { t } from 'i18next'
import path from 'path'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../core/api/books/create.js'
import { BookEpub } from '../../../core/book/book-epub.js'
import {
  useOrderedLangOptions,
  type LangCode,
  langCodes,
} from '../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../core/util/converter.js'
import { async } from '../../../core/util/promise.js'
import { Dropzone } from '../../components/dropzone.js'

function AddText() {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>()
  const [langCode, setLangCode] = useState<LangCode>()
  const [content, setContent] = useState<string>()

  return (
    <form
      style={{
        margin: '20px auto 0',
        width: '800px',
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
          value={langOptions.find((l) => l.value === langCode)}
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
          value={content}
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

function AddFile() {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>()
  const [langCode, setLangCode] = useState<LangCode>()
  const [file, setFile] = useState<File>()

  return (
    <form
      style={{
        margin: '20px auto 0',
        width: '800px',
      }}
      onSubmit={(e) => {
        e.preventDefault()
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

        <FormControl>
          <Dropzone
            onDrop={(files) => {
              const file = files[0]
              if (!file) {
                return
              }
              const ext = path.extname(file.name)
              const basename = path.basename(file.name, ext)
              setName(basename)
              async(async () => {
                if (file.name.endsWith('.epub')) {
                  const buf = await file.arrayBuffer()
                  const epub = await BookEpub.read(buf)
                  const langCode = (epub?.language ?? null) as LangCode | null
                  if (langCode && langCodes.includes(langCode)) {
                    setLangCode(langCode)
                  }
                }
                setFile(file)
              })
            }}
            prompt={t('prompt.uploadBook')}
          ></Dropzone>
        </FormControl>

        <Button fullWidth type="submit">
          {t('add')}
        </Button>
      </Stack>
    </form>
  )
}

export function BookAdd() {
  const [tab, setTab] = useState(0)
  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('file')}></Tab>
        <Tab label={t('text')}></Tab>
      </Tabs>
      {tab === 0 && <AddFile></AddFile>}
      {tab === 1 && <AddText></AddText>}
    </>
  )
}
