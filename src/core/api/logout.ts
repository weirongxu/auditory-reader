import { URouter } from '../route/router.js'

export type LogoutRes = {
  ok: boolean
}

export const logoutRouter = new URouter<void, LogoutRes>('logout').route(
  async ({ req }) => {
    const session = req.session
    await session.userLogout()
    return { ok: true }
  }
)
