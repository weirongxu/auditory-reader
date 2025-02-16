import { Button, Form, Progress, Space, Tag } from 'antd'
import { t } from 'i18next'
import JSZip from 'jszip'
import { useEffect, useState } from 'react'
import { async } from '../../../../core/util/promise.js'
import { FileInput } from '../../../components/file-input.js'
import {
  importBooks,
  importBooksList,
  type BookExportItem,
} from '../actions.js'

type Values = {
  file: File | undefined
}

export function AddImport() {
  const [submitted, setSubmitted] = useState(false)
  const [form] = Form.useForm<Values>()
  const file = Form.useWatch('file', form)
  const [zipInfo, setZipInfo] = useState<{
    zip: JSZip
    list: BookExportItem[]
  } | null>(null)
  const [progressPercent, setProgressPercent] = useState<number | null>(null)

  useEffect(() => {
    async(async () => {
      if (file) {
        const zip = await JSZip.loadAsync(await file.arrayBuffer())
        const list = await importBooksList(zip)
        setZipInfo({ zip, list })
      } else setZipInfo(null)
    })
  }, [file])

  return (
    <>
      {progressPercent !== null && <Progress percent={progressPercent} />}
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
              if (!zipInfo) return
              setProgressPercent(0)
              await importBooks(zipInfo.zip, zipInfo.list, (percent) => {
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
      {zipInfo?.list.length && (
        <Space
          direction="vertical"
          style={{ width: '100%', height: 300, overflow: 'auto' }}
        >
          <h3>{t('import')}</h3>
          <Space direction="vertical">
            {zipInfo.list.map((item, i) => (
              <Tag key={i}>
                {item.name} ({item.uuid})
              </Tag>
            ))}
          </Space>
        </Space>
      )}
    </>
  )
}
