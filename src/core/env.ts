import fs from 'fs'
import path from 'path'
import { isBrowser } from './util/browser.js'
import { randomString } from './util/random.js'

export type Account = {
  account: string
  password: string
}

export type AppMode = 'server' | 'service-worker'

export type Env = {
  isProduction: boolean
  appMode: AppMode
  appPort: number
  appBodyLimit: string
  appPublicRoot: string
  appApiRoot: string
  accounts: Account[]
  sessionKey: string
  dataPath: string
}

const dataPath = path.join(process.cwd(), 'server-data')

type Config = {
  appPort?: number
  appPublicPath?: string
  appBodyLimit?: string
  accounts?: Account[]
  sessionKey?: string
}

const config: Config = isBrowser
  ? {}
  : JSON.parse(fs.readFileSync('auditory-reader.config.json', 'utf8'))

const appPublicRoot = config.appPublicPath || process.env.APP_PUBLIC_PATH || '/'

export const env: Env = {
  isProduction: process.env.NODE_ENV === 'production',
  appMode: (process.env.APP_MODE as AppMode) || 'server',
  appPort: config.appPort ?? 4001,
  appBodyLimit: config.appBodyLimit ?? '20mb',
  appPublicRoot,
  appApiRoot: path.join(appPublicRoot, 'api'),
  dataPath,
  sessionKey: config.sessionKey || randomString(40),
  accounts: config.accounts ?? [],
}
