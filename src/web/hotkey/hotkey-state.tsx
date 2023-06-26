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
type HotkeyCallbackMap = Map<number, HotkeyCallback>
type HotkeysList = [key: string, callback: HotkeyCallbackMap][]
type HotkeyOption = {
  /**
   * The default value is 1, and the higher the level, the higher the priority.
   */
  level?: number
}

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
  const addHotkey = useCallback(
    (hotkeys: Hotkey, callback: () => void, options: HotkeyOption = {}) => {
      const key = getHotkeyKey(hotkeys)
      const level = options.level ?? 1

      let itemOrNil = hotkeysList.find(([k]) => k === key)
      if (!itemOrNil) {
        const callbackMap: HotkeyCallbackMap = new Map([[level, callback]])
        itemOrNil = [key, callbackMap]
        hotkeysList.push(itemOrNil)
      } else {
        if (itemOrNil[1].has(level))
          throw new Error(
            `Hotkey ${JSON.stringify(hotkeys)} level: ${level} already exists`
          )
        itemOrNil[1].set(level, callback)
      }
      const item = itemOrNil

      return function dispose() {
        item[1].delete(level)
        if (!item[1].size) {
          const i = hotkeysList.findIndex((it) => it === itemOrNil)
          if (i !== -1) hotkeysList.splice(i, 1)
        }
      }
    },
    []
  )

  const addHotkeys = useCallback(
    (
      hotkeys: [hotkey: Hotkey, callback: () => void][],
      options: HotkeyOption = {}
    ) => {
      const disposes: (() => void)[] = []
      for (const [hotkey, callback] of hotkeys) {
        disposes.push(addHotkey(hotkey, callback, options))
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
      // callback max level hotkey
      const levels = targetRet[1].keys()
      const maxLevel = Math.max(...levels)
      if (maxLevel) targetRet[1].get(maxLevel)?.()
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
