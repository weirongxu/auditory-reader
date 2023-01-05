import type { Request as ExRequest } from 'express'
import { USession } from './session.js'

type RequestGetter<Body> = {
  body: () => Promise<Body>
  url: () => string
  session: () => USession
  paths: () => string[]
}

export class URequest<Body> {
  static fromNode<Body>(req: ExRequest, dynamicPaths: string[]) {
    return new this<Body>({
      body: () => req.body,
      url: () => req.url,
      session: () => USession.fromNode(req.session),
      paths: () => dynamicPaths,
    })
  }

  static fromBrowser<Body>(req: Request, dynamicPaths: string[]) {
    return new this<Body>({
      body: async () => await req.json(),
      url: () => req.url,
      session: () => USession.fromBrowser(),
      paths: () => dynamicPaths,
    })
  }

  constructor(protected readonly getter: RequestGetter<Body>) {}

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
