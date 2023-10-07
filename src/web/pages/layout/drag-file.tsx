import { Close } from '@mui/icons-material'
import {
  Autocomplete,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { t } from 'i18next'
import path from 'path'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateByUrlRouter } from '../../../core/api/books/create-by-url.js'
import { booksCreateRouter } from '../../../core/api/books/create.js'
import { booksFetchUrlInfoRouter } from '../../../core/api/books/fetch-url-info.js'
import { BookEpub } from '../../../core/book/book-epub.js'
import type { LangCode } from '../../../core/lang.js'
import { parseLangCode, useOrderedLangOptions } from '../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../core/util/converter.js'
import { async } from '../../../core/util/promise.js'
import { isUrl } from '../../../core/util/url.js'
import { TMP_UUID } from '../../../core/consts.js'

type DragItem = DragItemUrl | DragItemEpub | DragItemText

type DragItemUrl = {
  type: 'url'
  title: string
  langCode?: LangCode
  url: string
}

type DragItemEpub = {
  type: 'file-epub'
  title: string
  langCode?: LangCode
  bufferBase64: string
}

type DragItemText = {
  type: 'file-text'
  title: string
  langCode?: LangCode
  bufferBase64: string
}

function hasFileOrUrl(event: React.DragEvent<HTMLDivElement>) {
  const items = filterFileOrUrl(event)
  return !!items.length
}

function filterFileOrUrl(event: React.DragEvent<HTMLDivElement>) {
  const items = [...event.dataTransfer.items]
  return items.filter((it) => {
    if (it.kind === 'file') return true
    if (it.kind === 'string' && it.type === 'text/uri-list') return true
    return false
  })
}

export function DragFile({ children }: { children: React.ReactNode }) {
  const [dragOver, setDragOver] = useState(0)
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [isInputLangCode, setIsInputLangCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const langOptions = useOrderedLangOptions()

  useEffect(() => {
    async(async () => {
      if (!dragItem) return
      if (!dragItem.langCode) {
        setIsInputLangCode(true)
        return
      }
      setLoading(true)
      if (dragItem.type === 'file-epub')
        await booksCreateRouter.action({
          bufferBase64: dragItem.bufferBase64,
          langCode: dragItem.langCode,
          name: dragItem.title,
          type: 'epub',
          isTmp: true,
        })
      else if (dragItem.type === 'file-text')
        await booksCreateRouter.action({
          bufferBase64: dragItem.bufferBase64,
          langCode: dragItem.langCode,
          name: dragItem.title,
          type: 'text',
          isTmp: true,
        })
      else if (dragItem.type === 'url')
        await booksCreateByUrlRouter.action({
          url: dragItem.url,
          langCode: dragItem.langCode,
          name: dragItem.title,
          isTmp: true,
        })
      setLoading(false)
      setDragItem(null)
      nav(`/books/view/${TMP_UUID}`)
    })
  }, [dragItem, nav])

  if (loading) return <CircularProgress></CircularProgress>

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      spacing={0}
      onDragEnter={(event) => {
        if (!hasFileOrUrl(event)) return
        setDragOver((c) => c + 1)
      }}
      onDragLeave={(event) => {
        if (!hasFileOrUrl(event)) return
        setDragOver((c) => c - 1)
      }}
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        async(async () => {
          setDragOver(0)
          setLoading(true)
          try {
            for (const item of filterFileOrUrl(event)) {
              if (item.kind === 'file') {
                const file = item.getAsFile()
                if (!file) continue
                const buf = await file.arrayBuffer()
                const epub = await BookEpub.read(buf)
                if (!epub) continue
                const langCode = parseLangCode(epub.language)
                const ext = path.extname(file.name)
                const basename = path.basename(file.name, ext)
                const bufferBase64 = arrayBufferToBase64(buf)
                if (ext === '.epub')
                  return setDragItem({
                    bufferBase64,
                    title: epub.title ?? basename,
                    type: 'file-epub',
                    langCode,
                  })
                else if (ext === '.txt' || ext === '.text')
                  return setDragItem({
                    bufferBase64,
                    title: basename,
                    type: 'file-text',
                    langCode,
                  })
              } else if (item.kind === 'string') {
                const url = await new Promise<string>((resolve) => {
                  item.getAsString(resolve)
                })
                if (!isUrl(url)) continue
                const info = await booksFetchUrlInfoRouter.action({ url })
                return setDragItem({
                  type: 'url',
                  url,
                  title: info.title,
                  langCode: info.lang,
                })
              }
            }
          } finally {
            setLoading(false)
          }
        })
      }}
    >
      {!!dragOver && (
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
            backgroundColor: 'var(--main-bg)',
          }}
        >
          {t('prompt.dropHere')}
        </Stack>
      )}
      {isInputLangCode && (
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 2,
            backgroundColor: 'var(--main-bg)',
          }}
          padding={5}
          spacing={2}
        >
          <Stack direction="row">
            <Typography flex={1}>{t('prompt.selectLanguage')}</Typography>
            <IconButton
              onClick={() => {
                setDragItem(null)
                setIsInputLangCode(false)
              }}
            >
              <Close></Close>
            </IconButton>
          </Stack>
          <Autocomplete
            placeholder={t('prompt.selectLanguage')}
            options={langOptions}
            onChange={(_, value) => {
              if (!dragItem || !value?.value) return
              setDragItem({ ...dragItem, langCode: value.value })
              setIsInputLangCode(false)
            }}
            renderInput={(params) => (
              <TextField {...params} label={t('language')} required />
            )}
          ></Autocomplete>
        </Stack>
      )}
      {children}
    </Stack>
  )
}
