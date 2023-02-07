import { useEffect, useRef } from 'react'
import { useHotkeys } from '../hotkey/hotkey-state.js'

export function useKeyEscape(callback: () => void) {
  const refCallback = useRef(callback)
  const { addHotkey } = useHotkeys()

  useEffect(() => {
    refCallback.current = callback
  }, [callback])

  useEffect(() => {
    const dispose = addHotkey('escape', () => {
      refCallback.current()
    })
    return () => {
      dispose()
    }
  }, [addHotkey])
}
