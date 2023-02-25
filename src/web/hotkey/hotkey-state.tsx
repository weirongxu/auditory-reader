import { useCallback, useEffect } from 'react'
import { isInputElement } from '../../core/util/dom.js'
import { createGlobalState } from '../hooks/createGlobalState.js'

type HotkeysMap = Map<string, (() => void)[]>

const hotkeysMap: HotkeysMap = new Map()

export const {
  useGlobalState: useHotkeyIframeWin,
  setGlobalState: setHotkeyIframeWin,
} = createGlobalState<{ win: Window | null }>({ win: null })

export function useHotkeys() {
  const addHotkey = useCallback((hotkey: string, callback: () => void) => {
    let callbacks = hotkeysMap.get(hotkey)
    if (!callbacks) {
      callbacks = []
      hotkeysMap.set(hotkey, callbacks)
    }
    callbacks.push(callback)
    return function dispose() {
      if (callbacks) {
        callbacks = callbacks.filter((c) => c !== callback)
        if (!callbacks.length) hotkeysMap.delete(hotkey)
      }
    }
  }, [])

  const addHotkeys = useCallback(
    (hotkeys: [hotkey: string, callback: () => void][]) => {
      const disposes: (() => void)[] = []
      for (const [hotkey, callback] of hotkeys) {
        disposes.push(addHotkey(hotkey, callback))
      }
      return function disposeAll() {
        disposes.forEach((dispose) => dispose())
      }
    },
    [addHotkey]
  )

  return { addHotkey, addHotkeys }
}

function getListener() {
  return (e: KeyboardEvent) => {
    if (isInputElement(e.target)) return
    if (e.altKey || e.ctrlKey) return
    const key = `${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`
    const cbs = hotkeysMap.get(key)
    if (cbs) {
      e.preventDefault()
      for (const cb of cbs) {
        cb()
      }
    }
  }
}

export function useHotkeysRegister() {
  const [refWin] = useHotkeyIframeWin()

  // global
  useEffect(() => {
    const listener = getListener()
    window.addEventListener('keydown', listener, { passive: false })
    return () => {
      window.removeEventListener('keydown', listener)
    }
  }, [])

  // iframe
  useEffect(() => {
    if (!refWin.win) return
    const listener = getListener()
    refWin.win.addEventListener('keydown', listener, { passive: false })
    return () => {
      refWin.win?.removeEventListener('keydown', listener)
    }
  }, [refWin])
}
