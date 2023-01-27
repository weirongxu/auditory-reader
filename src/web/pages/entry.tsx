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
import { BooksEntry } from './books/entry.js'
import { Layout } from './layout/layout.js'
import { GlobalSnackbar } from './layout/snackbar.js'
import { Login } from './login.js'
import { NotFound } from './not-found.js'

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
      <GlobalSnackbar></GlobalSnackbar>
      <Main></Main>
    </HashRouter>
  )
}
