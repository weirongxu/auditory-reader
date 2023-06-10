import path from 'path'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
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

export function useAction<Req, Res>(router: URouter<Req, Res>, arg: Req) {
  const navigate = useNavigate()
  const refArg = useRef<Req>(arg)
  refArg.current = arg

  const { data, error, mutate } = useSWR<Res | null, any>(
    [router.fullRoutePath, refArg.current],
    () => {
      try {
        return router.action(refArg.current)
      } catch (error) {
        if (error instanceof ActionUnauthorized) {
          navigate('/login')
          return null
        } else throw error
      }
    }
  )

  const reload = useCallback(() => {
    mutate().catch(console.error)
  }, [mutate])

  return { data, reload, error }
}
