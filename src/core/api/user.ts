import { URouter } from '../route/router.js'
import type { UserInfo } from '../route/session.js'

export type UserRes = {
  info?: UserInfo
}

export const userRouter = new URouter<null, UserRes>('user').route(
  ({ req }) => {
    const info = req.session.userInfo()
    return { info }
  },
)
