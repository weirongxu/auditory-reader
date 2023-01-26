import { Tab, Tabs } from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { AddFile } from './add/file.js'
import { AddText } from './add/text.js'
import { AddUrl } from './add/url.js'

export function BookAdd() {
  const [tab, setTab] = useState(0)
  return (
    <>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('file')}></Tab>
        <Tab label={t('text')}></Tab>
        <Tab label={t('url')}></Tab>
      </Tabs>
      {tab === 0 && <AddFile></AddFile>}
      {tab === 1 && <AddText></AddText>}
      {tab === 2 && <AddUrl></AddUrl>}
    </>
  )
}
