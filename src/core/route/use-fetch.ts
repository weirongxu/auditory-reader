import type { DependencyList } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { toError } from '../util/errors.js'

export type ReloadOptions = {
  signal?: AbortSignal | undefined
  clean?: boolean | undefined
}

export function useFetchBase<Res>(
  callback: () => Promise<Res>,
  option?: { deps?: DependencyList },
) {
  const refCallback = useRef(callback)
  const [data, setData] = useState<Res>()
  const [error, setError] = useState<Error>()

  const load = useCallback((signal: AbortSignal) => {
    refCallback
      .current()
      .then((res) => {
        if (signal.aborted) return
        setData(res)
      })
      .catch((error: unknown) => {
        if (signal.aborted) return
        setError(toError(error))
      })
  }, [])

  const reload = useCallback(
    ({ signal, clean = true }: ReloadOptions = {}) => {
      if (clean) setData(undefined)
      setError(undefined)
      load(signal ?? new AbortController().signal)
    },
    [load],
  )

  useEffect(() => {
    refCallback.current = callback
  }, [callback])

  useEffect(
    () => {
      const abort = new AbortController()
      load(abort.signal)
      return () => {
        abort.abort()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    option?.deps ?? [],
  )

  return { data, error, reload }
}

export function useFetch<Res, Args extends readonly unknown[]>(
  args: Args,
  callback: (...args: Args) => Promise<Res>,
) {
  return useFetchBase(() => callback(...args), { deps: [JSON.stringify(args)] })
}
