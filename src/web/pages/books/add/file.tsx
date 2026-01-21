import path from '@file-services/path'
import { Button, Form, Input } from 'antd'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../../core/api/books/create.js'
import { BookEpub } from '../../../../core/book/book-epub.js'
import { textToEpub } from '../../../../core/generate/converters.js'
import { parseLangCode, type LangCode } from '../../../../core/lang.js'
import {
  getBookNameByHtml,
  getBookNameByText,
} from '../../../../core/util/book.js'
import { arrayBufferToBase64 } from '../../../../core/util/converter.js'
import {
  isEpubFile,
  isHtmlFile,
  isTextFile,
} from '../../../../core/util/file.js'
import { async } from '../../../../core/util/promise.js'
import { FileInput } from '../../../components/file-input.js'
import { LanguageSelect } from '../../../components/language-select.js'
import { booksCreateByHtmlRouter } from '../../../../core/api/books/create-by-html.js'

type Values = {
  name: string
  langCode: LangCode
  file: File | undefined
}

export function AddFile() {
  const nav = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm<Values>()
  const file = Form.useWatch('file', form)

  useEffect(() => {
    async(async () => {
      if (!file) return
      if (isEpubFile(file)) {
        const buf = await file.arrayBuffer()
        const epub = await BookEpub.read(buf)
        if (!epub) return
        const ext = path.extname(file.name)
        const basename = path.basename(file.name, ext)
        form.setFieldValue('name', epub.title ?? basename)
        const langCode = parseLangCode(epub.language)
        if (langCode) {
          form.setFieldValue('langCode', langCode)
        }
      } else if (isTextFile(file)) {
        const content = await file.text()
        const name = getBookNameByText(content)
        if (!name) return
        form.setFieldValue('name', name)
      } else if (isHtmlFile(file)) {
        const html = await file.text()
        const name = await getBookNameByHtml(html)
        if (!name) return
        form.setFieldValue('name', name)
      }
    })
  }, [file, form])

  return (
    <Form<Values>
      form={form}
      style={{
        margin: '20px auto 0',
        maxWidth: '800px',
      }}
      initialValues={{
        name: '',
        langCode: null,
        file: null,
      }}
      onFinish={(values) => {
        async(async () => {
          try {
            setSubmitted(true)
            if (!values.file) return
            let epubBuf: ArrayBuffer | undefined
            let html: string | undefined
            if (isEpubFile(values.file)) {
              epubBuf = await values.file.arrayBuffer()
            } else if (isTextFile(values.file)) {
              const text = await values.file.text()
              epubBuf = await textToEpub(text, values.name, values.langCode)
            } else if (isHtmlFile(values.file)) {
              html = await values.file.text()
            }
            if (epubBuf) {
              const fileBase64 = arrayBufferToBase64(epubBuf)
              const entity = await booksCreateRouter.json({
                name: values.name,
                langCode: values.langCode,
                bufferBase64: fileBase64,
              })
              nav(`/books/added-successful/${entity.uuid}`)
            } else if (html) {
              const entity = await booksCreateByHtmlRouter.json({
                name: values.name,
                langCode: values.langCode,
                html,
              })
              nav(`/books/added-successful/${entity.uuid}`)
            }
          } finally {
            setSubmitted(false)
          }
        })
      }}
    >
      <Form.Item label={t('bookName')} name="name" rules={[{ required: true }]}>
        <Input placeholder={t('prompt.inputBookName')}></Input>
      </Form.Item>
      <Form.Item
        label={t('language')}
        name="langCode"
        rules={[{ required: true }]}
      >
        <LanguageSelect />
      </Form.Item>
      <Form.Item label={t('file')} name="file" rules={[{ required: true }]}>
        <FileInput prompt={t('prompt.uploadBook')}></FileInput>
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit" loading={submitted}>
          {t('add')}
        </Button>
      </Form.Item>
    </Form>
  )
}
