import { useCallback, useEffect, useState } from 'react'
import { Emitter } from '../../core/util/emitter.js'

export function createGlobalState<T>(defaultValue: T) {
  const globalRef: { state: T } = { state: defaultValue }
  const events = new Emitter<{ update: null }>()

  const getGlobalState = () => globalRef.state

  const setGlobalState = (state: T) => {
    globalRef.state = state
    events.fire('update', null)
  }

  const useGlobalState = () => {
    const [, setTick] = useState(1)

    useEffect(() => {
      const dispose = events.on('update', () => {
        setTick((c) => c + 1)
      })
      return () => {
        dispose()
      }
    }, [])

    const setState = useCallback((state: T) => {
      setGlobalState(state)
    }, [])

    return [globalRef.state, setState] as const
  }

  return { getGlobalState, setGlobalState, useGlobalState }
}
