import path from 'path'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { env } from '../env.js'
import type { URouter } from './router'

export type Action<ReqType, ResType> = (body: ReqType) => Promise<ResType>

export class ActionUnauthorized extends Error {
  constructor() {
    super()
  }
}

export class ActionRequestError extends Error {
  constructor(public readonly message: string) {
    super()
  }
}

export class ActionError<T> extends Error {
  constructor(public data: T) {
    super()
  }
}

export function getActionPath(urlPath: string): string {
  return path.join(env.appApiRoot, urlPath)
}

export function useAction<R, P>(router: URouter<R, P>, arg: R) {
  const [firstLoad, setFirstLoad] = useState(false)
  const [error, setError] = useState<ActionError<any>>()
  const [data, setData] = useState<P | null>(null)
  const navigate = useNavigate()
  const refArg = useRef<R>(arg)
  refArg.current = arg

  const reload = useCallback(() => {
    router
      .action(refArg.current)
      .then((json) => {
        setData(json)
      })
      .catch((error) => {
        if (error instanceof ActionUnauthorized) {
          navigate('/login')
          return
        }
        console.error(error)
        setError(error)
      })
  }, [navigate, router])

  useEffect(() => {
    if (firstLoad) return
    setFirstLoad(true)
    reload()
  }, [firstLoad, reload])

  return { data, reload, error }
}
