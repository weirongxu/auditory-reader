import { Chip, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { t } from 'i18next'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { isInputElement } from '../../core/util/dom.js'
import { useKeyEscape } from '../hooks/useEscape.js'
import styles from './hotkey-state.module.scss'

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
type HotkeysList = [
  key: string,
  keyDescription: string[],
  description: string,
  callback: HotkeyCallbackMap
][]
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

function getHotkeyDesc(hotkey: Hotkey): string[] {
  if (Array.isArray(hotkey)) {
    return hotkey.map(getHotkeyDesc).flat()
  } else if (typeof hotkey === 'string') {
    return [hotkey]
  } else {
    let s = ''
    if (hotkey.shift) s += 'shift+'
    if (hotkey.ctrl) s += 'ctrl+'
    if (hotkey.alt) s += 'alt+'
    s += hotkey.key
    return [s]
  }
}

export function useHotkeys() {
  const addHotkey = useCallback(
    (
      hotkeys: Hotkey,
      description: string,
      callback: () => void,
      options: HotkeyOption = {}
    ) => {
      const key = getHotkeyKey(hotkeys)
      const keyDescs = getHotkeyDesc(hotkeys)
      const level = options.level ?? 1

      let itemOrNil = hotkeysList.find(([k]) => k === key)
      if (!itemOrNil) {
        const callbackMap: HotkeyCallbackMap = new Map([[level, callback]])
        itemOrNil = [key, keyDescs, description, callbackMap]
        hotkeysList.push(itemOrNil)
      } else {
        if (itemOrNil[3].has(level))
          throw new Error(
            `Hotkey ${JSON.stringify(hotkeys)} level: ${level} already exists`
          )
        itemOrNil[3].set(level, callback)
      }
      const item = itemOrNil

      return function dispose() {
        item[3].delete(level)
        if (!item[3].size) {
          const i = hotkeysList.findIndex((it) => it === itemOrNil)
          if (i !== -1) hotkeysList.splice(i, 1)
        }
      }
    },
    []
  )

  const addHotkeys = useCallback(
    (
      hotkeys: [hotkey: Hotkey, description: string, callback: () => void][],
      options: HotkeyOption = {}
    ) => {
      const disposes: (() => void)[] = []
      for (const [hotkey, description, callback] of hotkeys) {
        disposes.push(addHotkey(hotkey, description, callback, options))
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
      const levels = targetRet[3].keys()
      const maxLevel = Math.max(...levels)
      if (maxLevel) targetRet[3].get(maxLevel)?.()
    }
  }
}

function useHotkeysRegister() {
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

export function HotkeysProvider() {
  const [open, setOpen] = useState(false)
  const { addHotkey } = useHotkeys()
  useHotkeysRegister()

  useEffect(() => {
    addHotkey({ shift: true, key: '?' }, t('hotkey.helper'), () => {
      setOpen(true)
    })
  }, [addHotkey])

  useKeyEscape(() => {
    setOpen(false)
  })

  return (
    <Dialog
      maxWidth={false}
      open={open}
      onClose={() => {
        setOpen(false)
      }}
    >
      <DialogTitle>{t('hotkey.title')}</DialogTitle>
      <DialogContent>
        <ul className={styles.hotkeyList}>
          {hotkeysList.map(([, keyDescs, description], i) => (
            <li key={i}>
              <div className="keys">
                {keyDescs.map((k, j) => (
                  <kbd key={j}>{k}</kbd>
                ))}
              </div>
              <div className="desc">{description}</div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
