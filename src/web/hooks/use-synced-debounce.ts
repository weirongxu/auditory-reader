import { useDebouncedState } from '@react-hookz/web'
import { useEffect } from 'react'

export function useSyncedDebounced<T>(
  value: T,
  delay: number,
  maxWait?: number,
) {
  const [state, setState] = useDebouncedState(value, delay, maxWait)
  useEffect(() => {
    setState(value)
  }, [setState, value])
  return state
}
