// styles
import './app.scss'

// modules
import {
  Alert,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import { ConfirmProvider } from 'material-ui-confirm'
import { useEffect, useState } from 'react'
import { globalStyle } from '../core/style.js'
import { useStyle } from './hooks/useStyle.js'
import { RootEntry } from './pages/entry.js'
import { registerAPI } from './service-worker/register.js'
import { useTheme } from './theme.js'

export function App() {
  const theme = useTheme()
  const [loadedStatus, setLoadedStatus] = useState<boolean | string>(false)

  useEffect(() => {
    registerAPI()
      .then((status) => {
        if (status === 'unsupported')
          setLoadedStatus('Service worker is unsupported')
        else if (status === 'failed')
          setLoadedStatus('Service worker load failed')
        else setLoadedStatus(true)
      })
      .catch((err) => {
        setLoadedStatus('Service worker load failed')
        console.error(err)
      })
  }, [])

  useStyle(globalStyle)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmProvider>
        {loadedStatus === true && <RootEntry></RootEntry>}
        {loadedStatus === false && <CircularProgress></CircularProgress>}
        {typeof loadedStatus === 'string' && (
          <Alert title={loadedStatus} severity="error">
            {loadedStatus}
          </Alert>
        )}
      </ConfirmProvider>
    </ThemeProvider>
  )
}
