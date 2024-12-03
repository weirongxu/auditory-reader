import { faClose } from '@fortawesome/free-solid-svg-icons'
import { Button, Form, Typography } from 'antd'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateByHtmlRouter } from '../../../core/api/books/create-by-html.js'
import { booksCreateByUrlRouter } from '../../../core/api/books/create-by-url.js'
import { booksCreateRouter } from '../../../core/api/books/create.js'
import { booksFetchUrlInfoRouter } from '../../../core/api/books/fetch-url-info.js'
import { BookEpub } from '../../../core/book/book-epub.js'
import { TMP_UUID } from '../../../core/consts.js'
import { textToEpub } from '../../../core/generate/converters.js'
import type { LangCode } from '../../../core/lang.js'
import { parseLangCode } from '../../../core/lang.js'
import { getBookNameByHtml } from '../../../core/util/book.js'
import { arrayBufferToBase64 } from '../../../core/util/converter.js'
import { eventBan } from '../../../core/util/dom.js'
import {
  getBookNameByFile,
  isEpubFile,
  isHtmlFile,
  isTextFile,
} from '../../../core/util/file.js'
import { async } from '../../../core/util/promise.js'
import { isUrl } from '../../../core/util/url.js'
import { FlexBox } from '../../components/flex-box.js'
import { Icon } from '../../components/icon.js'
import { LanguageSelect } from '../../components/language-select.js'
import { SpinFullscreen } from '../../components/spin.js'

type DragItem = DragItemUrl | DragItemEpub | DragItemHtml | DragItemText

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
  buffer: ArrayBuffer
}

type DragItemHtml = {
  type: 'file-html'
  title: string
  langCode?: LangCode
  html: string
}

type DragItemText = {
  type: 'file-text'
  title: string
  langCode?: LangCode
  content: string
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
      let epubBuf: ArrayBuffer | undefined
      let url: string | undefined
      let html: string | undefined
      switch (dragItem.type) {
        case 'file-epub': {
          epubBuf = dragItem.buffer
          break
        }
        case 'file-html': {
          html = dragItem.html
          break
        }
        case 'file-text': {
          epubBuf = await textToEpub(
            dragItem.content,
            dragItem.title,
            dragItem.langCode,
          )
          break
        }
        case 'url': {
          url = dragItem.url
          break
        }
      }
      if (epubBuf)
        await booksCreateRouter.json({
          bufferBase64: arrayBufferToBase64(epubBuf),
          langCode: dragItem.langCode,
          name: dragItem.title,
          isTmp: true,
        })
      else if (url)
        await booksCreateByUrlRouter.json({
          url,
          langCode: dragItem.langCode,
          name: dragItem.title,
          isTmp: true,
        })
      else if (html)
        await booksCreateByHtmlRouter.json({
          html,
          langCode: dragItem.langCode,
          name: dragItem.title,
          isTmp: true,
        })

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
                const basename = getBookNameByFile(file)
                if (isEpubFile(file)) {
                  const buf = await file.arrayBuffer()
                  const epub = await BookEpub.read(buf)
                  if (!epub) continue
                  const langCode = parseLangCode(epub.language)
                  return setDragItem({
                    buffer: buf,
                    title: epub.title ?? basename,
                    type: 'file-epub',
                    langCode,
                  })
                } else if (isTextFile(file)) {
                  const content = await file.text()
                  return setDragItem({
                    content,
                    title: basename,
                    type: 'file-text',
                  })
                } else if (isHtmlFile(file)) {
                  const html = await file.text()
                  const title = await getBookNameByHtml(html)
                  return setDragItem({
                    html,
                    title,
                    type: 'file-html',
                  })
                }
              } else if (item.kind === 'string') {
                const url = await new Promise<string>((resolve) => {
                  item.getAsString(resolve)
                })
                if (!isUrl(url)) continue
                const info = await booksFetchUrlInfoRouter.json({ url })
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
