import { useEffect } from 'react'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { userRouter } from '../../core/api/user.js'
import { useAction } from '../../core/route/action.js'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { useSpeechSpeed } from '../store.js'
import { BooksEntry } from './books/entry.js'
import { Layout } from './layout/layout.js'
import { Login } from './login.js'
import { NotFound } from './not-found.js'
import { useHintText } from '../common/hint-text.js'
import { t } from 'i18next'

function Books() {
  const { data: user } = useAction(userRouter, null)
  const nav = useNavigate()
  useEffect(() => {
    if (user && !user.info) {
      nav('/login')
    }
  }, [nav, user])

  return (
    <Layout>
      <BooksEntry />
    </Layout>
  )
}

function Main() {
  const [, setSpeechSpeed] = useSpeechSpeed()
  const { addHotkeys } = useHotkeys()
  const { openHint } = useHintText()

  // hotkey
  useEffect(() => {
    const dispose = addHotkeys([
      [
        '[',
        t('hotkey.speedDown'),
        () =>
          setSpeechSpeed((v) => {
            const n = (v * 10 - 1) / 10
            openHint(`${t('speed')}: ${n}`)
            return n
          }),
      ],
      [
        ']',
        t('hotkey.speedUp'),
        () =>
          setSpeechSpeed((v) => {
            const n = (v * 10 + 1) / 10
            openHint(`${t('speed')}: ${n}`)
            return n
          }),
      ],
      [
        'r',
        t('hotkey.reload'),
        () => {
          location.reload()
        },
      ],
    ])
    return dispose
  })

  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/books/*" element={<Books></Books>}></Route>
      <Route path="/" element={<Navigate to="/books" />}></Route>
      <Route
        path="*"
        element={
          <Layout>
            <NotFound title="page"></NotFound>
          </Layout>
        }
      ></Route>
    </Routes>
  )
}

export function RootEntry() {
  return (
    <HashRouter>
      <Main></Main>
    </HashRouter>
  )
}
