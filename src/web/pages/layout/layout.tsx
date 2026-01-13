import { faBook, faGear } from '@fortawesome/free-solid-svg-icons'
import { Button, Drawer, Modal, Typography } from 'antd'
import { t } from 'i18next'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutRouter } from '../../../core/api/logout.js'
import { env } from '../../../core/env.js'
import { FlexBox } from '../../components/flex-box.js'
import { Icon } from '../../components/icon.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { defaultTitle, useTitle } from '../../hooks/use-title.js'
import { AppBarProgress } from './app-bar-progress.js'
import { DragFile } from './drag-file.js'
import styles from './layout.module.scss'
import { GlobalSettings, SettingLine } from './settings.js'
import { appBarStatesAtom } from './use-app-bar.js'

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const title = useTitle() ?? defaultTitle
  const [appBarStates] = useAtom(appBarStatesAtom)
  const [showSettings, setShowSettings] = useState(false)
  const nav = useNavigate()
  const [openedBookTitle, setOpenedBookTitle] = useState(false)

  const appBar = (
    <FlexBox
      className={[styles.appBar, 'top'].join(' ')}
      dir="row"
      style={{
        justifyContent: 'end',
        position: 'relative',
      }}
      gap={4}
    >
      {!!appBarStates.topProgress && (
        <AppBarProgress progress={appBarStates.topProgress}></AppBarProgress>
      )}
      <FlexBox
        dir="row"
        style={{
          overflow: 'hidden',
          alignItems: 'center',
        }}
        gap={4}
      >
        <LinkWrap to="/books">
          {(href) => (
            <Button type="link" size="small" href={href}>
              <Icon size="2xl" icon={faBook} />
            </Button>
          )}
        </LinkWrap>
        <Typography
          style={{
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer',
          }}
          title={title}
          onClick={() => {
            setOpenedBookTitle(true)
          }}
        >
          {title}
        </Typography>
        <Modal
          title={t('bookName')}
          open={openedBookTitle}
          footer={false}
          onCancel={() => setOpenedBookTitle(false)}
        >
          <Typography>{title}</Typography>
        </Modal>
      </FlexBox>
      <FlexBox dir="row" style={{ alignItems: 'center', flex: 1 }} gap={4}>
        {appBarStates.topLeft}
      </FlexBox>
      <FlexBox dir="row" style={{ alignItems: 'center' }} gap={4}>
        {appBarStates.topRight}
      </FlexBox>
    </FlexBox>
  )

  const appBarBottom = (
    <FlexBox
      className={[styles.appBar, 'bottom'].join(' ')}
      dir="row"
      style={{
        flexWrap: 'wrap',
        justifyContent: 'end',
      }}
      gap={4}
    >
      <FlexBox
        dir="row"
        style={{
          alignItems: 'center',
          flex: 1,
        }}
        gap={4}
      >
        {appBarStates.bottomLeft1}
        {appBarStates.bottomLeft2}
      </FlexBox>
      <FlexBox dir="row" style={{ alignItems: 'center' }} gap={4}>
        {appBarStates.bottomRight1}
        {appBarStates.bottomRight2}
        <FlexBox dir="row" style={{ alignItems: 'center' }} gap={4}>
          <Button
            shape="circle"
            type="text"
            onClick={() => {
              setShowSettings((v) => !v)
            }}
            icon={<Icon icon={faGear} />}
          ></Button>
          <Drawer
            placement="right"
            open={showSettings}
            onClose={() => setShowSettings(false)}
            title={t('setting.title')}
            forceRender
          >
            <FlexBox style={{ flex: 1, minWidth: 300, gap: 6 }}>
              <FlexBox style={{ flex: 1, gap: 6 }}>
                {appBarStates.settings}
                <GlobalSettings></GlobalSettings>
              </FlexBox>
              <FlexBox>
                {env.appMode === 'server' && (
                  <SettingLine>
                    <Button
                      type="primary"
                      block
                      onClick={() => {
                        logoutRouter
                          .json()
                          .then(() => {
                            nav('/')
                          })
                          .catch(console.error)
                      }}
                    >
                      {t('logout')}
                    </Button>
                  </SettingLine>
                )}
              </FlexBox>
            </FlexBox>
          </Drawer>
        </FlexBox>
      </FlexBox>
    </FlexBox>
  )

  return (
    <DragFile>
      <FlexBox
        style={{
          width: '100%',
          height: '100%',
          alignContent: 'space-around',
          justifyContent: 'space-around',
        }}
      >
        {appBar}
        <div
          style={{
            flex: 1,
            padding: 8,
            overflow: 'hidden',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
        {appBarBottom}
      </FlexBox>
    </DragFile>
  )
}
