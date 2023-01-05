import type { Response as ExResponse } from 'express'

type ResponseSetter = {
  header: (name: string, value: string | number) => void
  status: (code: number) => void
}

export class UResponseHold {
  headers: Record<string, string> = {}
  status?: number
}

export class UResponse<Body> {
  static fromNode(res: ExResponse) {
    return new this({
      header: (name, value) => res.setHeader(name, value),
      status: (s: number) => res.status(s),
    })
  }

  static fromBrowser(res: UResponseHold) {
    return new this({
      header: (name, value) => (res.headers[name] = value.toString()),
      status: (code: number) => (res.status = code),
    })
  }

  constructor(protected readonly setter: ResponseSetter) {}

  header(name: string, value: string) {
    this.setter.header(name, value)
    return this
  }

  status(code: number) {
    this.setter.status(code)
    return this
  }
}
