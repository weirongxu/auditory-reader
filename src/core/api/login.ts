import { URouter } from '../route/router.js'

export type LoginReq = {
  account: string
  password: string
}

export type LoginRes = {
  ok: boolean
}

export const loginRouter = new URouter<LoginReq, LoginRes>('login').route(
  async ({ req }) => {
    const session = req.session
    const body = await req.body
    const logined = await session.userLogin(body.account, body.password)
    return {
      ok: logined,
    }
  }
)
