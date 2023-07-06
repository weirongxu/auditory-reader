// styles
import './app.scss'

// modules
import {
  Alert,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { COLOR_SCHEME_DARK_CLASS } from '../core/consts.js'
import { useStyle } from './hooks/useStyle.js'
import { useHotkeysRegister } from './hotkey/hotkey-state.js'
import { RootEntry } from './pages/entry.js'
import { PreviewImageProvider } from './common/preview-image.js'
import { registerAPI } from './service-worker/register.js'
import { globalStyle } from './style.js'
import { useAppTheme } from './theme.js'
import { Provider } from 'jotai'
import { globalStore } from './store/global.js'
import { HintTextProvider } from './common/hint-text.js'
import { ConfirmProvider } from './common/confirm.js'
import { SnackbarPrivider } from './common/snackbar.js'
import { TitleProvider } from './hooks/useTitle.js'

function AppRegistrar() {
  const theme = useAppTheme()
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

  useEffect(() => {
    if (theme.palette.mode === 'dark')
      document.documentElement.classList.add(COLOR_SCHEME_DARK_CLASS)
    else document.documentElement.classList.remove(COLOR_SCHEME_DARK_CLASS)
  }, [theme.palette.mode])
  useStyle(globalStyle)
  useHotkeysRegister()

  return (
    <>
      {loadedStatus === true && <RootEntry></RootEntry>}
      {loadedStatus === false && <CircularProgress></CircularProgress>}
      {typeof loadedStatus === 'string' && (
        <Alert title={loadedStatus} severity="error">
          {loadedStatus}
        </Alert>
      )}
    </>
  )
}

export function App() {
  const theme = useAppTheme()
  return (
    <Provider store={globalStore}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend}>
          <AppRegistrar></AppRegistrar>
          <SnackbarPrivider></SnackbarPrivider>
          <HintTextProvider></HintTextProvider>
          <PreviewImageProvider></PreviewImageProvider>
          <ConfirmProvider></ConfirmProvider>
          <TitleProvider></TitleProvider>
        </DndProvider>
      </ThemeProvider>
    </Provider>
  )
}
