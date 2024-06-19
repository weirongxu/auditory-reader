import { Button, Form, Input } from 'antd'
import { t } from 'i18next'
import path from 'path'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../../core/api/books/create.js'
import { BookEpub } from '../../../../core/book/book-epub.js'
import { parseLangCode, type LangCode } from '../../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../../core/util/converter.js'
import { async } from '../../../../core/util/promise.js'
import { FileInput } from '../../../components/file-input.js'
import { LanguageSelect } from '../../../components/language-select.js'

type Values = {
  name: string
  langCode: LangCode
  file: File
}

export function AddFile() {
  const nav = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm<Values>()
  const file = Form.useWatch('file', form)

  useEffect(() => {
    async(async () => {
      if (file.name.endsWith('.epub')) {
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
            if (values.file.name.endsWith('.epub')) {
              const buf = await values.file.arrayBuffer()
              const fileBase64 = arrayBufferToBase64(buf)
              const entity = await booksCreateRouter.action({
                name: values.name,
                langCode: values.langCode,
                bufferBase64: fileBase64,
                type: 'epub',
              })
              nav(`/books/added-successful/${entity.uuid}`)
            } else if (values.file.name.endsWith('.txt')) {
              const buf = await values.file.arrayBuffer()
              const fileBase64 = arrayBufferToBase64(buf)
              const entity = await booksCreateRouter.action({
                name: values.name,
                langCode: values.langCode,
                bufferBase64: fileBase64,
                type: 'text',
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
        <FileInput
          onChange={(files) => {
            const file = files.at(0)
            if (!file) return
            async(async () => {})
          }}
          prompt={t('prompt.uploadBook')}
        ></FileInput>
      </Form.Item>
      <Form.Item>
        <Button block type="primary" htmlType="submit" loading={submitted}>
          {t('add')}
        </Button>
      </Form.Item>
    </Form>
  )
}
