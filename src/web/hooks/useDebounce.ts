import { useCallback, useRef } from 'react'

export function useDebounce() {
  const timer = useRef<NodeJS.Timer>()
  const execDebounce = useCallback(
    (delayMs: number, handler: () => unknown | Promise<unknown>) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => handler(), delayMs)
    },
    []
  )
  return { timer, execDebounce }
}
