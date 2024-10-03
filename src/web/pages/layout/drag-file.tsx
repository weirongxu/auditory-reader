import { faClose } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, Typography } from 'antd'
import { t } from 'i18next'
import path from '@file-services/path'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateByUrlRouter } from '../../../core/api/books/create-by-url.js'
import { booksCreateRouter } from '../../../core/api/books/create.js'
import { booksFetchUrlInfoRouter } from '../../../core/api/books/fetch-url-info.js'
import { BookEpub } from '../../../core/book/book-epub.js'
import { TMP_UUID } from '../../../core/consts.js'
import type { LangCode } from '../../../core/lang.js'
import { parseLangCode } from '../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../core/util/converter.js'
import { eventBan } from '../../../core/util/dom.js'
import { async } from '../../../core/util/promise.js'
import { isUrl } from '../../../core/util/url.js'
import { FlexBox } from '../../components/flex-box.js'
import { Icon } from '../../components/icon.js'
import { LanguageSelect } from '../../components/language-select.js'
import { SpinFullscreen } from '../../components/spin.js'

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

  useEffect(() => {
    async(async () => {
      if (!dragItem) return
      if (!dragItem.langCode) {
        setIsInputLangCode(true)
        return
      }
      setLoading(true)
      switch (dragItem.type) {
        case 'file-epub':
          await booksCreateRouter.action({
            bufferBase64: dragItem.bufferBase64,
            langCode: dragItem.langCode,
            name: dragItem.title,
            type: 'epub',
            isTmp: true,
          })
          break
        case 'file-text':
          await booksCreateRouter.action({
            bufferBase64: dragItem.bufferBase64,
            langCode: dragItem.langCode,
            name: dragItem.title,
            type: 'text',
            isTmp: true,
          })
          break
        case 'url':
          await booksCreateByUrlRouter.action({
            url: dragItem.url,
            langCode: dragItem.langCode,
            name: dragItem.title,
            isTmp: true,
          })
          break
      }
      setLoading(false)
      setDragItem(null)
      nav(`/books/view/${TMP_UUID}`)
    })
  }, [dragItem, nav])

  if (loading) return <SpinFullscreen />

  return (
    <FlexBox
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
      gap={0}
      onDragEnter={(event) => {
        if (!hasFileOrUrl(event)) return
        setDragOver((c) => c + 1)
      }}
      onDragLeave={(event) => {
        if (!hasFileOrUrl(event)) return
        setDragOver((c) => c - 1)
      }}
      onDragOver={(event) => {
        eventBan(event)
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
        <FlexBox
          style={{
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
        </FlexBox>
      )}
      {isInputLangCode && (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 2,
            backgroundColor: 'var(--main-bg)',
            padding: 40,
          }}
        >
          <FlexBox dir="row">
            <Typography style={{ flex: 1 }}>
              {t('prompt.selectLanguage')}
            </Typography>
            <Button
              shape="circle"
              type="text"
              onClick={() => {
                setDragItem(null)
                setIsInputLangCode(false)
              }}
              icon={<Icon icon={faClose} />}
            ></Button>
          </FlexBox>
          <Form.Item label={t('language')} name="langCode" required>
            <LanguageSelect
              onChange={(value) => {
                if (!dragItem || !value) return
                setDragItem({ ...dragItem, langCode: value as LangCode })
                setIsInputLangCode(false)
              }}
            ></LanguageSelect>
          </Form.Item>
        </div>
      )}
      {children}
    </FlexBox>
  )
}
