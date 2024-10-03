/* eslint-disable no-console */

// env
process.env.APP_MODE = 'server'
import { env } from '../core/env.js'

// modules
import express from 'express'
import session from 'express-session'
import path from 'path'
import GetFileStore from 'session-file-store'
import { ROUTERS } from '../core/api/index.js'
import { URequest } from '../core/route/request.js'
import { UResponse } from '../core/route/response.js'
import { ErrorRequestResponse } from '../core/route/session.js'
import 'isomorphic-fetch'

const app = express()

// static
app.use(express.static('server-public'))

// request parameter
app.use(express.urlencoded({ extended: false }))
app.use(express.json({ limit: env.appBodyLimit }))

// session
app.set('trust proxy', 1)
const FileStore = GetFileStore(session)
app.use(
  session({
    store: new FileStore({ path: path.join(env.dataPath, 'sessions') }),
    secret: env.sessionKey,
    name: 'app_session',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60 * 60 * 1000 * 24 * 7,
    },
  }),
)

console.debug('register routes')
for (const router of ROUTERS) {
  const fullRoutePath = router.isDynamic
    ? `${router.fullRoutePath}/*`
    : router.fullRoutePath
  console.debug('  ', router.method, fullRoutePath)
  app[router.method](fullRoutePath, (req, res) => {
    console.debug(req.method, req.path)
    const dynamicPaths = router.getDynamicPaths(req.path)
    if (router.handler) {
      const ctx = {
        req: URequest.fromNode<any>(req, dynamicPaths),
        res: UResponse.fromNode(res),
      }
      Promise.resolve(router.handler(ctx))
        .then((data) => {
          if (data) {
            res.send(data)
          }
        })
        .catch((error) => {
          if (error instanceof ErrorRequestResponse) {
            res.status(400)
            res.send({ message: error.message })
          } else if (error instanceof Error) {
            console.error(error)
            res.status(500)
            res.send({ message: error.message })
          }
        })
    } else {
      res.status(404)
      res.send()
    }
  })
}

app.listen(env.appPort)

// eslint-disable-next-line no-console
console.log(`Server started at port ${env.appPort}`)
