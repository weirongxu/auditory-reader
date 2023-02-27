import { Add, MenuBook, Settings } from '@mui/icons-material'
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
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutRouter } from '../../../core/api/logout.js'
import { env } from '../../../core/env.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { GlobalSettings, SettingLine } from './settings.js'
import { useAppBarStates } from './use-app-bar.js'
import styles from './layout.module.scss'
import { isMobile } from '../../../core/util/browser.js'

const barPos = isMobile ? 'bottom' : 'top'

export const Layout = (props: { children?: React.ReactNode }) => {
  const [appBarStates] = useAppBarStates()
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
      className={[styles.appBar, barPos].join(' ')}
      direction="row"
      flexWrap="wrap"
      justifyContent="end"
    >
      <Stack direction="row" alignItems="center" flex={1} spacing={1}>
        <LinkWrap to="/books">
          {(href) => (
            <MuiLink href={href}>
              <Typography display="flex">
                <MenuBook sx={{ marginRight: 1 }}></MenuBook>
                {appBarStates.title ?? 'Auditory Reader'}
              </Typography>
            </MuiLink>
          )}
        </LinkWrap>
        {appBarStates.left}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        {appBarStates.right}
        <LinkWrap to="/books/add">
          {(href) => (
            <IconButton href={href} title={t('add')}>
              <Add />
            </IconButton>
          )}
        </LinkWrap>
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
    <Stack
      style={{
        width: '100%',
        height: '100%',
      }}
      alignContent="space-around"
      justifyContent="space-around"
      spacing={1}
    >
      {barPos === 'top' && appBar}
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
      {barPos === 'bottom' && appBar}
    </Stack>
  )
}
