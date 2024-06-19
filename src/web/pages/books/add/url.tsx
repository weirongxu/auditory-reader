import { Button, Form, Input, Space } from 'antd'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksCreateByUrlRouter } from '../../../../core/api/books/create-by-url.js'
import { booksFetchUrlInfoRouter } from '../../../../core/api/books/fetch-url-info.js'
import { type LangCode } from '../../../../core/lang.js'
import { async } from '../../../../core/util/promise.js'
import { LanguageSelect } from '../../../components/language-select.js'

type Values = {
  name: string
  langCode: LangCode
  url: string
}

export function AddUrl() {
  const nav = useNavigate()
  const [isFetchingURL, setIsFetchingURL] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm<Values>()

  return (
    <>
      <Form
        form={form}
        style={{
          margin: '20px auto 0',
          maxWidth: '800px',
        }}
        initialValues={{
          name: '',
          langCode: null,
          url: '',
        }}
        onFinish={(values) => {
          async(async () => {
            try {
              setSubmitted(true)
              const entity = await booksCreateByUrlRouter.action({
                name: values.name,
                langCode: values.langCode,
                url: values.url,
              })
              nav(`/books/added-successful/${entity.uuid}`)
            } finally {
              setSubmitted(false)
            }
          })
        }}
      >
        <Form.Item
          label={t('bookName')}
          name="name"
          rules={[{ required: true }]}
        >
          <Input placeholder={t('prompt.inputBookName')}></Input>
        </Form.Item>
        <Form.Item
          label={t('language')}
          name="langCode"
          rules={[{ required: true }]}
        >
          <LanguageSelect />
        </Form.Item>
        <Form.Item label={t('url')} name="url" rules={[{ required: true }]}>
          <Space.Compact style={{ width: '100%' }}>
            <Input></Input>
            <Button
              style={{ alignSelf: 'center' }}
              type="primary"
              loading={isFetchingURL}
              onClick={() => {
                const url = form.getFieldValue('url')
                if (!url) return
                setIsFetchingURL(true)
                booksFetchUrlInfoRouter
                  .action({ url })
                  .then((info) => {
                    form.setFieldValue('name', info.title)
                    if (info.lang) form.setFieldValue('langCode', info.lang)
                  })
                  .catch(console.error)
                  .finally(() => setIsFetchingURL(false))
              }}
            >
              {t('extractUrlInfo')}
            </Button>
          </Space.Compact>
        </Form.Item>
        <Form.Item>
          <Button block htmlType="submit" type="primary" loading={submitted}>
            {t('add')}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
