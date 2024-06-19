import { t } from 'i18next'
import { useState } from 'react'
import { AddFile } from './add/file.js'
import { AddText } from './add/text.js'
import { AddUrl } from './add/url.js'
import { Tabs } from 'antd'

type TabType = 'text' | 'file' | 'url'

export function BookAdd() {
  const [tab, setTab] = useState<TabType>('text')
  return (
    <Tabs
      defaultActiveKey={tab}
      onChange={(k) => setTab(k as TabType)}
      destroyInactiveTabPane
      items={[
        {
          key: 'text',
          label: t('text'),
          children: <AddText />,
        },
        {
          key: 'file',
          label: t('file'),
          children: <AddFile />,
        },
        {
          key: 'url',
          label: t('url'),
          children: <AddUrl />,
        },
      ]}
    ></Tabs>
  )
}
