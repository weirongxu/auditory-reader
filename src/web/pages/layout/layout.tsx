import { MenuBook, Settings } from '@mui/icons-material'
import {
  Box,
  Button,
  createTheme,
  Drawer,
  IconButton,
  Link as MuiLink,
  Stack,
  ThemeProvider,
  Typography,
  useTheme,
} from '@mui/material'
import { t } from 'i18next'
import { useAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutRouter } from '../../../core/api/logout.js'
import { env } from '../../../core/env.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { DragFile } from './drag-file.js'
import styles from './layout.module.scss'
import { GlobalSettings, SettingLine } from './settings.js'
import { appBarStatesAtom } from './use-app-bar.js'
import { defaultTitle, useTitle } from '../../hooks/useTitle.js'

export const Layout = (props: { children?: React.ReactNode }) => {
  const [title] = useTitle()
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
        theme
      ),
    [theme]
  )

  const appBar = (
    <Stack
      className={[styles.appBar, 'top'].join(' ')}
      direction="row"
      justifyContent="end"
    >
      <Stack direction="row" overflow="hidden" alignItems="center" spacing={1}>
        <LinkWrap to="/books">
          {(href) => (
            <MuiLink href={href}>
              <MenuBook sx={{ marginRight: 1 }}></MenuBook>
            </MuiLink>
          )}
        </LinkWrap>
        <Typography flex={1} noWrap overflow="hidden" textOverflow="ellipsis">
          {title ?? defaultTitle}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" flex={1} spacing={1}>
        {appBarStates.topLeft}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {appBarStates.topRight}
      </Stack>
    </Stack>
  )

  const appBarBottom = (
    <Stack
      className={[styles.appBar, 'bottom'].join(' ')}
      direction="row"
      flexWrap="wrap"
      justifyContent="end"
    >
      <Stack direction="row" alignItems="center" flex={1} spacing={1}>
        {appBarStates.bottomLeft}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {appBarStates.bottomRight}
        <Stack direction="row" alignItems="center">
          <IconButton
            onClick={() => {
              setShowSettings((v) => !v)
            }}
          >
            <Settings />
          </IconButton>
          <Drawer
            anchor="right"
            open={showSettings}
            onClose={() => setShowSettings(false)}
          >
            <Stack sx={{ flex: 1, padding: 2, minWidth: 300 }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: 1,
                }}
              >
                <h3 style={{ margin: 0 }}>{t('setting.title')}</h3>
              </Box>
              <Stack sx={{ flex: 1 }}>
                <ThemeProvider theme={settingsTheme}>
                  {appBarStates.settings}
                  <GlobalSettings></GlobalSettings>
                </ThemeProvider>
              </Stack>
              <Stack>
                {env.appMode === 'server' && (
                  <SettingLine>
                    <Button
                      sx={{ flex: 1 }}
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
              </Stack>
            </Stack>
          </Drawer>
        </Stack>
      </Stack>
    </Stack>
  )

  return (
    <DragFile>
      <Stack
        style={{
          width: '100%',
          height: '100%',
        }}
        alignContent="space-around"
        justifyContent="space-around"
        spacing={1}
      >
        {appBar}
        <div
          style={{
            flex: 1,
            padding: '0 8px',
            overflow: 'hidden',
            overflowY: 'auto',
          }}
        >
          {props.children}
        </div>
        {appBarBottom}
      </Stack>
    </DragFile>
  )
}
