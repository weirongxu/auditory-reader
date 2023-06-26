import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { isInputElement } from '../../core/util/dom.js'

type Hotkey =
  | string
  | {
      ctrl?: boolean
      shift?: boolean
      alt?: boolean
      key: string
    }
  | Hotkey[]

type HotkeyCallback = () => void
type HotkeysList = [key: string, callbacks: HotkeyCallback[]][]

const sequenceSymbol = ' '
const hotkeysList: HotkeysList = []
let curKeySeq = ''
const seqTimeout = 1000

export const hotkeyIframeWinAtom = atom<{ win: Window | null }>({ win: null })

function getHotkeyKey(hotkey: Hotkey): string {
  if (Array.isArray(hotkey)) {
    return hotkey.map(getHotkeyKey).join(sequenceSymbol)
  } else if (typeof hotkey === 'string') {
    return hotkey.toLowerCase()
  } else {
    let s = ''
    if (hotkey.shift) s += 'shift+'
    if (hotkey.ctrl) s += 'ctrl+'
    if (hotkey.alt) s += 'alt+'
    s += hotkey.key.toLowerCase()
    return s
  }
}

export function useHotkeys() {
  const addHotkey = useCallback((hotkeys: Hotkey, callback: () => void) => {
    const key = getHotkeyKey(hotkeys)
    let callbacks: HotkeyCallback[]

    let itemOrNil = hotkeysList.find(([k]) => k === key)
    if (!itemOrNil) {
      callbacks = [callback]
      itemOrNil = [key, callbacks]
      hotkeysList.push(itemOrNil)
    } else {
      itemOrNil[1].unshift(callback)
    }
    const item = itemOrNil
    return function dispose() {
      item[1] = item[1].filter((c) => c !== callback)
      if (!item[1].length) {
        const i = hotkeysList.findIndex((it) => it === itemOrNil)
        if (i !== -1) hotkeysList.splice(i, 1)
      }
    }
  }, [])

  const addHotkeys = useCallback(
    (hotkeys: [hotkey: Hotkey, callback: () => void][]) => {
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

let sequenceTimer: ReturnType<typeof setTimeout> | undefined = undefined

function getListener() {
  return (e: KeyboardEvent) => {
    if (isInputElement(e.target)) return
    const hotkey: Hotkey = {
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      key: e.key.toLowerCase(),
    }
    const triggeredKey = getHotkeyKey(hotkey)
    // eslint-disable-next-line no-console
    console.log('triggered-key:', triggeredKey)
    const fullKey = curKeySeq + triggeredKey
    const fullSubKey = fullKey + sequenceSymbol
    const targetRet = hotkeysList.find(([key]) => key === fullKey)
    const hasSubRet = hotkeysList.find(([key]) => key.startsWith(fullSubKey))
    if (!targetRet && !hasSubRet) return
    e.preventDefault()
    curKeySeq = ''
    clearTimeout(sequenceTimer)
    if (hasSubRet) {
      curKeySeq = fullSubKey
      sequenceTimer = setTimeout(() => {
        curKeySeq = ''
      }, seqTimeout)
    } else if (targetRet) {
      // callback latest hotkey
      const callback = targetRet[1][0]
      callback?.()
    }
  }
}

export function useHotkeysRegister() {
  const [refWin] = useAtom(hotkeyIframeWinAtom)

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
