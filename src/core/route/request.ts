import type { Request as ExpressRequest } from 'express'
import { USession } from './session.js'

type RequestGetter<Body> = {
  searchParams: () => URLSearchParams
  body: () => Promise<Body>
  url: () => string
  session: () => USession
  paths: () => string[]
}

export class URequest<Body> {
  static fromNode<Body>(req: ExpressRequest, dynamicPaths: string[]) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') searchParams.append(key, value)
      else if (Array.isArray(value))
        for (const item of value)
          if (typeof item === 'string') searchParams.append(key, item)
    }
    return new this<Body>({
      searchParams: () => searchParams,
      body: () => req.body,
      url: () => req.url,
      session: () => USession.fromNode(req.session),
      paths: () => dynamicPaths,
    })
  }

  static fromBrowser<Body>(req: Request, dynamicPaths: string[]) {
    return new this<Body>({
      searchParams: () => new URLSearchParams(req.url.split('?')[1]),
      body: async () => await req.json(),
      url: () => req.url,
      session: () => USession.fromBrowser(),
      paths: () => dynamicPaths,
    })
  }

  constructor(protected readonly getter: RequestGetter<Body>) {}

  get searchParams() {
    return this.getter.searchParams()
  }

  get body(): Promise<Body> {
    return this.getter.body()
  }

  get url() {
    return this.getter.url()
  }

  get paths() {
    return this.getter.paths()
  }

  get session() {
    return this.getter.session()
  }
}
