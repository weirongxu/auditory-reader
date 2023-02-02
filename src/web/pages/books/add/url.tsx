import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateByUrlRouter } from '../../../../core/api/books/create-by-url.js'
import { booksFetchUrlInfoRouter } from '../../../../core/api/books/fetch-url-info.js'
import { useOrderedLangOptions, type LangCode } from '../../../../core/lang.js'
import { async } from '../../../../core/util/promise.js'

export function AddUrl() {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>()
  const [langCode, setLangCode] = useState<LangCode>()
  const [url, setUrl] = useState<string>()
  const [isFetching, setIsFetching] = useState(false)

  return (
    <>
      <Dialog
        open={isFetching}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Fetching URL</DialogTitle>
        <DialogContent>
          <Stack alignItems="center">
            <CircularProgress />
          </Stack>
        </DialogContent>
      </Dialog>
      <form
        style={{
          margin: '20px auto 0',
          maxWidth: '800px',
        }}
        onSubmit={(e) => {
          e.preventDefault()
          async(async () => {
            if (!name) return
            if (!url) return
            if (!langCode) return
            setIsFetching(true)
            try {
              const entity = await booksCreateByUrlRouter.action({
                name,
                langCode,
                url,
              })
              nav(`/books/added-successful/${entity.uuid}`)
            } finally {
              setIsFetching(false)
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

          <Stack direction="row">
            <TextField
              required
              label={t('url')}
              sx={{ flex: 1 }}
              value={url ?? ''}
              onChange={(e) => {
                setUrl(e.target.value)
              }}
            ></TextField>
            <Button
              sx={{ alignSelf: 'end' }}
              onClick={() => {
                if (!url) return
                booksFetchUrlInfoRouter
                  .action({ url })
                  .then((info) => {
                    setName(info.title)
                    if (info.lang) setLangCode(info.lang)
                  })
                  .catch(console.error)
              }}
            >
              {t('extractUrlInfo')}
            </Button>
          </Stack>

          <Button fullWidth type="submit">
            {t('add')}
          </Button>
        </Stack>
      </form>
    </>
  )
}
