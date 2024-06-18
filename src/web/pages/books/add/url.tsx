import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateByUrlRouter } from '../../../../core/api/books/create-by-url.js'
import { booksFetchUrlInfoRouter } from '../../../../core/api/books/fetch-url-info.js'
import { useOrderedLangOptions, type LangCode } from '../../../../core/lang.js'
import { eventBan } from '../../../../core/util/dom.js'
import { async } from '../../../../core/util/promise.js'
import { FlexBox } from '../../../components/flex-box.js'
import { SpinCenter } from '../../../components/spin.js'

export function AddUrl() {
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()
  const [name, setName] = useState<string>()
  const [langCode, setLangCode] = useState<LangCode>()
  const [url, setUrl] = useState<string>()
  const [isFetching, setIsFetching] = useState(false)

  return (
    <>
      <Dialog open={isFetching}>
        <DialogTitle>Fetching URL</DialogTitle>
        <DialogContent>
          <FlexBox style={{ alignItems: 'center' }}>
            <SpinCenter />
          </FlexBox>
        </DialogContent>
      </Dialog>
      <form
        style={{
          margin: '20px auto 0',
          maxWidth: '800px',
        }}
        onSubmit={(e) => {
          eventBan(e)
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

          <FlexBox dir="row" gap={4}>
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
          </FlexBox>

          <Button fullWidth type="submit">
            {t('add')}
          </Button>
        </FlexBox>
      </form>
    </>
  )
}
