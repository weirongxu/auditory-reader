import fs from 'fs'
import path from '@file-services/path'
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

type Config = {
  appPort?: number
  appPublicPath?: string
  appBodyLimit?: string
  accounts?: Account[]
  sessionKey?: string
}

const dataPath = 'server-data'
const configPath = 'auditory-reader.config.json'
const config: Config =
  !isBrowser && fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {}

const appPublicRoot = config.appPublicPath || process.env.APP_PUBLIC_PATH || '/'

export const env: Env = {
  isProduction: process.env.NODE_ENV === 'production',
  appMode: (process.env.APP_MODE as AppMode | undefined) || 'server',
  appPort: config.appPort ?? 4001,
  appBodyLimit: config.appBodyLimit ?? '20mb',
  appPublicRoot,
  appApiRoot: path.join(appPublicRoot, 'api'),
  dataPath,
  sessionKey: config.sessionKey || randomString(40),
  accounts: config.accounts ?? [],
}
