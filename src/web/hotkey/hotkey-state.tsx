import { useCallback, useEffect } from 'react'
import { createGlobalState } from 'react-hooks-global-state'
import { isInputElement } from '../../core/util/dom.js'

type HotkeysMap = Map<string, (() => void)[]>

const hotkeysMap: HotkeysMap = new Map()

const { useGlobalState, setGlobalState } = createGlobalState<{
  iframeWin: Window | null
}>({ iframeWin: null })

export const useHotkeyIframeWin: () => readonly [
  Window | null,
  (u: React.SetStateAction<Window | null>) => void
] = () => {
  return useGlobalState('iframeWin')
}

export const setHotkeyIframeWin = (win: Window) => {
  setGlobalState('iframeWin', win)
}

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
  const [win] = useHotkeyIframeWin()

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
    if (!win) return
    const listener = getListener()
    win.addEventListener('keydown', listener, { passive: false })
    return () => {
      win.removeEventListener('keydown', listener)
    }
  }, [win])
}
