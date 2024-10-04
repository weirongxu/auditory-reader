import path from '@file-services/path'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
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

export function actionCatchError(navigate: NavigateFunction) {
  return (error: unknown) => {
    if (error instanceof ActionUnauthorized) {
      navigate('/login')
      return false
    } else throw error
  }
}

type ActionOptions = {
  /**
   * @default true
   */
  clearWhenReload?: boolean
  request?: boolean
}

export function useAction<Req, Res>(
  router: URouter<Req, Res>,
  arg: Req,
  options?: ActionOptions,
) {
  const navigate = useNavigate()
  const refArg = useRef<Req>(arg)
  refArg.current = arg
  const argJson = JSON.stringify(arg)
  const refOptions = useRef<ActionOptions | undefined>(options)
  refOptions.current = options
  const [data, setData] = useState<Res>()
  const [error, setError] = useState<any>()

  const load = useCallback(
    (signal: AbortSignal) => {
      router
        .json(refArg.current)
        .then((res) => {
          if (signal.aborted) return
          setData(res)
        })
        .catch((error) => {
          if (signal.aborted) return
          if (error instanceof ActionUnauthorized) {
            navigate('/login')
            return null
          } else {
            setError(error)
          }
        })
    },
    [navigate, router],
  )

  const reload = useCallback(
    (options?: { signal?: AbortSignal }) => {
      if (refOptions.current?.clearWhenReload !== false) {
        setData(undefined)
        setError(undefined)
      }
      load(options?.signal ?? new AbortController().signal)
    },
    [load],
  )

  // load
  useEffect(() => {
    if (!argJson) return
    if (options?.request === false) return
    const abort = new AbortController()
    reload({ signal: abort.signal })
    return () => {
      abort.abort()
    }
  }, [argJson, options?.request, reload])

  return { data, reload, error }
}
