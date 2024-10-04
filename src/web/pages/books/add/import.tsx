import { Button, Form, Progress, Space, Tag } from 'antd'
import { t } from 'i18next'
import JSZip from 'jszip'
import { useEffect, useMemo, useState } from 'react'
import { async } from '../../../../core/util/promise.js'
import { FileInput } from '../../../components/file-input.js'
import { importBooks, importBooksList } from '../actions.js'

type Values = {
  file: File | undefined
}

export function AddImport() {
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm<Values>()
  const file = Form.useWatch('file', form)
  const [zip, setZip] = useState<JSZip | null>(null)
  const list = useMemo(() => (zip ? importBooksList(zip) : []), [zip])
  const [progressPercent, setProgressPercent] = useState<number | null>(null)

  useEffect(() => {
    async(async () => {
      if (file) setZip(await JSZip.loadAsync(await file.arrayBuffer()))
      else setZip(null)
    })
  }, [file])

  return (
    <>
      {!!progressPercent && <Progress percent={progressPercent} />}
      <Form<Values>
        form={form}
        style={{
          margin: '20px auto 0',
          maxWidth: '800px',
        }}
        initialValues={{
          file: null,
        }}
        onFinish={() => {
          async(async () => {
            try {
              if (!zip) return
              setProgressPercent(null)
              await importBooks(zip, list, (percent) => {
                setProgressPercent(percent)
              })
            } finally {
              setProgressPercent(null)
              setSubmitted(false)
            }
          })
        }}
      >
        <Form.Item label={t('file')} name="file" rules={[{ required: true }]}>
          <FileInput accept=".zip" prompt={t('prompt.importBooks')}></FileInput>
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={submitted}>
            {t('import')}
          </Button>
        </Form.Item>
      </Form>
      {!!list.length && (
        <Space
          direction="vertical"
          style={{ width: '100%', height: 300, overflow: 'auto' }}
        >
          <h3>{t('import')}</h3>
          <Space direction="vertical">
            {list.map((item, i) => (
              <Tag key={i}>{item.basename}</Tag>
            ))}
          </Space>
        </Space>
      )}
    </>
  )
}
