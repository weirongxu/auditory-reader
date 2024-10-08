import { notificationApi } from '../../web/common/notification.js'
import {
  ActionError,
  ActionRequestError,
  ActionUnauthorized,
  getActionPath,
} from './action.js'
import type { URequest } from './request'
import type { UResponse } from './response'
import type { UserInfo } from './session'

type ApiContext<R, P, M> = {
  req: URequest<R>
  res: UResponse<P>
} & M

type ApiHandler<R = any, P = any, M = object> = (
  context: ApiContext<R, P, M>,
) => P | Promise<P>

type RouterMethod = 'get' | 'post'

type RouterResponseType = 'json' | 'buffer'

export type RouterOptions = {
  method?: RouterMethod
  responseType?: RouterResponseType
  isDynamic?: boolean
}

export class URouter<Req = any, Res = any> {
  fullRoutePath: string
  method: RouterMethod
  responseType: RouterResponseType
  isDynamic: boolean
  handler?: ApiHandler<Req, Res, object>

  constructor(
    public readonly routePath: string,
    {
      method = 'post',
      responseType = 'json',
      isDynamic = false,
    }: RouterOptions = {},
  ) {
    this.fullRoutePath = getActionPath(routePath)
    this.method = method
    this.responseType = responseType
    this.isDynamic = isDynamic
  }

  isMatch(ctx: { method: string; pathname: string }) {
    if (this.method !== ctx.method.toLowerCase()) return false
    if (this.isDynamic) return ctx.pathname.startsWith(this.fullRoutePath)
    return this.fullRoutePath === ctx.pathname
  }

  getDynamicPaths(pathname: string) {
    if (!this.isDynamic) return []
    if (!pathname.startsWith(this.fullRoutePath))
      throw new Error('getDynamicPaths pathname not match')
    return pathname
      .slice(this.fullRoutePath.length)
      .replace(/^\/*/, '')
      .split('/')
  }

  async json(body: Req, signal?: AbortSignal): Promise<Res> {
    const res = await fetch(this.fullRoutePath, {
      method: this.method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      body: body ? JSON.stringify(body) : null,
    })
    if (res.status === 401) throw new ActionUnauthorized()
    if (res.status.toString().startsWith('4')) {
      const json = await res.json()
      notificationApi().error({
        message: 'Error',
        description: json.message,
      })
      throw new ActionRequestError(json.message)
    }
    if (!res.status.toString().startsWith('2'))
      throw new ActionError(await res.json())
    return await res.json()
  }

  async file(body: Req, signal?: AbortSignal): Promise<Blob> {
    const res = await fetch(this.fullRoutePath, {
      method: this.method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      body: body ? JSON.stringify(body) : null,
    })
    if (res.status === 401) throw new ActionUnauthorized()
    if (!res.ok) throw new ActionError(await res.text())
    return await res.blob()
  }

  route(handler: ApiHandler<Req, Res>) {
    this.handler = handler

    return this
  }

  routeLogined(handler: ApiHandler<Req, Res, { userInfo: UserInfo }>) {
    this.route((context) => {
      const session = context.req.session
      const userInfo = session.userInfo()
      if (!userInfo) {
        context.res.status(401)
        return {} as any
      }
      return handler({
        ...(context as ApiContext<Req, Res, any>),
        userInfo,
      })
    })

    return this
  }
}
