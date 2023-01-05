import { MenuBook, Settings } from '@mui/icons-material'
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutRouter } from '../../../core/api/logout.js'
import { env } from '../../../core/env.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { GlobalSettings } from './settings.js'
import { SettingLine, useGlboalHeaderItems } from './use-header.js'

export const Layout = (props: { children?: React.ReactNode }) => {
  const [leftItems] = useGlboalHeaderItems('left')
  const [rightItems] = useGlboalHeaderItems('right')
  const [settings] = useGlboalHeaderItems('settings')
  const [showSettings, setShowSettings] = useState(false)
  const nav = useNavigate()

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
      <Stack
        direction="row"
        style={{
          borderBottom: '1px solid #e9ecef',
          padding: 8,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          flex="1"
          spacing={1}
        >
          <LinkWrap to="/books">
            {(href) => (
              <MuiLink href={href}>
                <Typography display="flex">
                  <MenuBook sx={{ marginRight: 1 }}></MenuBook>
                  Auditory Reader
                </Typography>
              </MuiLink>
            )}
          </LinkWrap>
          {leftItems}
        </Stack>
        <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1}>
          {rightItems}
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
                  <h3 style={{ margin: 0 }}>{t('settings')}</h3>
                </Box>
                <Stack sx={{ flex: 1 }}>
                  {settings}
                  <GlobalSettings></GlobalSettings>
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
    </Stack>
  )
}
