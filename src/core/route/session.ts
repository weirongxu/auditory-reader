import type session from 'express-session'
import { env } from '../env.js'

type SessionNode = session.Session & Partial<session.SessionData>

declare module 'express-session' {
  interface SessionData {
    user?: string
  }
}

export class ErrorRequestResponse extends Error {}

export type UserInfo = {
  account: string
}

export class USession {
  static fromNode(session: SessionNode) {
    return new this(session, null)
  }

  static fromBrowser() {
    return new this(null, { account: 'anonymous' })
  }

  constructor(
    public readonly nodeSession: SessionNode | null,
    public readonly browserUser: UserInfo | null,
  ) {}

  userInfo(): UserInfo | undefined {
    if (this.browserUser) {
      return this.browserUser
    } else if (this.nodeSession) {
      return this.nodeSession.user
        ? {
            account: this.nodeSession.user,
          }
        : undefined
    }
  }

  async userLogin(account: string, password: string) {
    if (!this.nodeSession) return false

    if (
      env.accounts.find((a) => a.account === account && a.password === password)
    ) {
      this.nodeSession.user = account
      this.nodeSession.save()
      return true
    } else {
      return false
    }
  }

  async userLogout() {
    if (!this.nodeSession) return
    this.nodeSession.user = undefined
    this.nodeSession.save()
  }

  userLogined() {
    return !!this.userInfo()
  }

  async save() {
    if (this.nodeSession) this.nodeSession.save()
  }
}

export function createUserStore(session: SessionNode) {
  return {
    login: async (account: string, password: string) => {
      if (
        session &&
        env.accounts.find(
          (a) => a.account === account && a.password === password,
        )
      ) {
        session.user = account
        session.save()
        return true
      } else {
        return false
      }
    },
    logout: async () => {
      session.user = undefined
      session.save()
    },
    logined() {
      return !!this.info()
    },
    info: (): UserInfo | null => {
      return session?.user
        ? {
            account: session.user,
          }
        : null
    },
  }
}
