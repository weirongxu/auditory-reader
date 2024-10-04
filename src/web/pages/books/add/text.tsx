import { Button, Form, Input } from 'antd'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateRouter } from '../../../../core/api/books/create.js'
import { type LangCode } from '../../../../core/lang.js'
import { arrayBufferToBase64 } from '../../../../core/util/converter.js'
import { async } from '../../../../core/util/promise.js'
import { splitLines } from '../../../../core/util/text.js'
import { LanguageSelect } from '../../../components/language-select.js'
import { Textarea } from '../../../components/textarea.js'

type Values = {
  name: string
  langCode: LangCode
  content: string
}

export function AddText() {
  const nav = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm<Values>()
  const content = Form.useWatch('content', form)

  useEffect(() => {
    if (!content) return
    const name = form.getFieldValue('name')
    if (!name) {
      const lines = splitLines(content)
      const newName = lines.find((line) => !!line.trim())
      if (newName) form.setFieldValue('name', newName)
    }
  }, [content, form])

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
        content: '',
      }}
      onFinish={(values) => {
        async(async () => {
          try {
            setSubmitted(true)
            const buf = new TextEncoder().encode(values.content)
            const fileBase64 = arrayBufferToBase64(buf)
            const entity = await booksCreateRouter.json({
              name: values.name,
              langCode: values.langCode,
              bufferBase64: fileBase64,
              type: 'text',
            })
            nav(`/books/added-successful/${entity.uuid}`)
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
      <Form.Item
        label={t('bookContent')}
        name="content"
        rules={[{ required: true }]}
      >
        <Textarea rows={6}></Textarea>
      </Form.Item>
      <Form.Item>
        <Button block htmlType="submit" type="primary" loading={submitted}>
          {t('add')}
        </Button>
      </Form.Item>
    </Form>
  )
}
