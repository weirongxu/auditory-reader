// styles
import './app.scss'

// modules
import { Alert } from 'antd'
import 'antd/dist/reset.css'
import { Provider } from 'jotai'
import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { COLOR_SCHEME_DARK_CLASS } from '../core/consts.js'
import { ConfirmProvider } from './common/confirm.js'
import { HintTextProvider } from './common/hint-text.js'
import { MessageProvider, NotificationProvider } from './common/notification.js'
import { PreviewImageProvider } from './common/preview-image.js'
import { SpinFullscreen } from './components/spin.js'
import { useStyle } from './hooks/use-style.js'
import { TitleProvider } from './hooks/use-title.js'
import { HotkeysProvider } from './hotkey/hotkey-state.js'
import { RootEntry } from './pages/entry.js'
import { registerAPI } from './service-worker/register.js'
import { globalStore } from './store/global.js'
import { globalStyle } from './style.js'
import { AntdConfigProvider, useColorScheme } from './theme.js'

function AppEntry() {
  const theme = useColorScheme()
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
    if (theme === 'dark')
      document.documentElement.classList.add(COLOR_SCHEME_DARK_CLASS)
    else document.documentElement.classList.remove(COLOR_SCHEME_DARK_CLASS)
  }, [theme])
  useStyle(globalStyle)

  return (
    <>
      {loadedStatus === true && <RootEntry></RootEntry>}
      {loadedStatus === false && <SpinFullscreen />}
      {typeof loadedStatus === 'string' && (
        <Alert type="error" message={loadedStatus}></Alert>
      )}
    </>
  )
}

function AppProvider() {
  return (
    <AntdConfigProvider>
      <DndProvider backend={HTML5Backend}>
        <AppEntry></AppEntry>
        <NotificationProvider></NotificationProvider>
        <MessageProvider></MessageProvider>
        <HintTextProvider></HintTextProvider>
        <PreviewImageProvider></PreviewImageProvider>
        <ConfirmProvider></ConfirmProvider>
        <TitleProvider></TitleProvider>
        <HotkeysProvider></HotkeysProvider>
      </DndProvider>
    </AntdConfigProvider>
  )
}

export function App() {
  return (
    <Provider store={globalStore}>
      <AppProvider></AppProvider>
    </Provider>
  )
}
