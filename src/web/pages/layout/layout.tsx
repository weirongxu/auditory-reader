import { MenuBook, Settings } from '@mui/icons-material'
import {
  Drawer,
  ThemeProvider,
  Typography,
  createTheme,
  useTheme,
} from '@mui/material'
import { Button } from 'antd'
import { t } from 'i18next'
import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutRouter } from '../../../core/api/logout.js'
import { env } from '../../../core/env.js'
import { FlexBox } from '../../components/flex-box.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { defaultTitle, useTitle } from '../../hooks/use-title.js'
import { DragFile } from './drag-file.js'
import * as styles from './layout.module.scss'
import { GlobalSettings, SettingLine } from './settings.js'
import { appBarStatesAtom } from './use-app-bar.js'

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const title = useTitle() ?? defaultTitle
  const [appBarStates] = useAtom(appBarStatesAtom)
  const [showSettings, setShowSettings] = useState(false)
  const nav = useNavigate()
  const theme = useTheme()
  const settingsTheme = useMemo(
    () =>
      createTheme(
        {
          components: {
            MuiTextField: {
              defaultProps: {
                inputProps: { sx: { textAlign: 'right' } },
              },
            },
          },
        },
        theme,
      ),
    [theme],
  )

  const appBar = (
    <FlexBox
      className={[styles.appBar, 'top'].join(' ')}
      dir="row"
      style={{
        justifyContent: 'end',
      }}
      gap={4}
    >
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
              <MenuBook sx={{ marginRight: 1 }}></MenuBook>
            </Button>
          )}
        </LinkWrap>
        <Typography
          flex={1}
          noWrap
          overflow="hidden"
          textOverflow="ellipsis"
          title={title}
        >
          {title}
        </Typography>
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
        {appBarStates.bottomLeft}
      </FlexBox>
      <FlexBox dir="row" style={{ alignItems: 'center' }} gap={4}>
        {appBarStates.bottomRight}
        <FlexBox dir="row" style={{ alignItems: 'center' }} gap={4}>
          <Button
            shape="circle"
            type="text"
            onClick={() => {
              setShowSettings((v) => !v)
            }}
            icon={<Settings />}
          ></Button>
          <Drawer
            anchor="right"
            open={showSettings}
            onClose={() => setShowSettings(false)}
          >
            <FlexBox style={{ flex: 1, padding: 8, minWidth: 300 }}>
              <FlexBox
                style={{
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: 1,
                }}
              >
                <h3 style={{ margin: 0 }}>{t('setting.title')}</h3>
              </FlexBox>
              <FlexBox style={{ flex: 1 }}>
                <ThemeProvider theme={settingsTheme}>
                  {appBarStates.settings}
                  <GlobalSettings></GlobalSettings>
                </ThemeProvider>
              </FlexBox>
              <FlexBox>
                {env.appMode === 'server' && (
                  <SettingLine>
                    <Button
                      type="primary"
                      block
                      onClick={() => {
                        logoutRouter
                          .action()
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
