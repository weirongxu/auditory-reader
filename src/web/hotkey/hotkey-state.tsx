import { Modal } from 'antd'
import { t } from 'i18next'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { orderBy } from '../../core/util/collection.js'
import { eventBan, isInputElement } from '../../core/util/dom.js'
import { capitalize } from '../../core/util/text.js'
import { iframeWinAtom } from '../atoms.js'
import { useKeyEscape } from '../hooks/use-escape.js'
import { globalStore } from '../store/global.js'
import * as styles from './hotkey-state.module.scss'

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
type HotkeyCompiledItem = [
  key: string,
  keyDescription: string[],
  description: string,
  callback: HotkeyCallbackMap,
]
type HotkeyCompiledItemList = HotkeyCompiledItem[]
export type HotkeyItem = [
  hotkey: Hotkey,
  description: string,
  callback: () => void,
]
export type HotkeyOption = {
  /**
   * The default value is 1, and the higher the level, the higher the priority.
   */
  level?: number
}

const sequenceSymbol = ' '
const hotkeyItemsAtom = atom<HotkeyCompiledItemList>([])
let curKeySeq = ''
const seqTimeout = 1000

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

function getKeyDesc(key: string): string {
  let s = ''
  if (key.length > 1) s += capitalize(key)
  else if (key === ' ') s += 'Space'
  else s += key
  return s
}

function getHotkeyDesc(hotkey: Hotkey): string[] {
  if (Array.isArray(hotkey)) {
    return hotkey.map(getHotkeyDesc).flat()
  } else if (typeof hotkey === 'string') {
    return [getKeyDesc(hotkey)]
  } else {
    let s = ''
    const hasModifier = hotkey.shift || hotkey.ctrl || hotkey.alt
    if (hasModifier) s += '<'
    if (hotkey.shift) s += 'Shift-'
    if (hotkey.ctrl) s += 'Ctrl-'
    if (hotkey.alt) s += 'Alt-'
    s += getKeyDesc(hotkey.key)
    if (hasModifier) s += '>'
    return [s]
  }
}

export function useHotkeys() {
  const addHotkeys = useCallback(
    (hotkeys: HotkeyItem[], options: HotkeyOption = {}) => {
      const hotkeyItems = globalStore.get(hotkeyItemsAtom)
      const updatedItems: { item: HotkeyCompiledItem; level: number }[] = []
      for (const [hotkey, description, callback] of hotkeys) {
        const key = getHotkeyKey(hotkey)
        const keyDescs = getHotkeyDesc(hotkey)
        const level = options.level ?? 1

        let item = hotkeyItems.find(([k]) => k === key)
        if (!item) {
          const callbackMap: HotkeyCallbackMap = new Map([[level, callback]])
          item = [key, keyDescs, description, callbackMap]
          hotkeyItems.push(item)
        } else {
          if (item[3].has(level))
            throw new Error(
              `Hotkey ${JSON.stringify(hotkey)} level: ${level} already exists`,
            )
          item[3].set(level, callback)
        }
        updatedItems.push({ item, level })
      }
      globalStore.set(hotkeyItemsAtom, [...hotkeyItems])

      return function dispose() {
        const hotkeyItems = globalStore.get(hotkeyItemsAtom)
        const removeItems: HotkeyCompiledItemList = []
        for (const { item, level } of updatedItems) {
          item[3].delete(level)
          if (!item[3].size) removeItems.push(item)
        }
        globalStore.set(
          hotkeyItemsAtom,
          hotkeyItems.filter((item) => !removeItems.includes(item)),
        )
      }
    },
    [],
  )

  const addHotkey = useCallback(
    (
      hotkey: Hotkey,
      description: string,
      callback: () => void,
      options: HotkeyOption = {},
    ) => {
      return addHotkeys([[hotkey, description, callback]], options)
    },
    [addHotkeys],
  )

  return { addHotkey, addHotkeys }
}

let sequenceTimer: ReturnType<typeof setTimeout> | undefined = undefined

function getListener() {
  return (e: KeyboardEvent) => {
    if (isInputElement(e.target)) return
    const hotkeyItems = globalStore.get(hotkeyItemsAtom)
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
    const targetRet = hotkeyItems.find(([key]) => key === fullKey)
    const hasSubRet = hotkeyItems.find(([key]) => key.startsWith(fullSubKey))
    if (!targetRet && !hasSubRet) return
    eventBan(e)
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
  const [refWin] = useAtom(iframeWinAtom)

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
  const [hotkeyItems] = useAtom(hotkeyItemsAtom)
  useHotkeysRegister()

  useEffect(() => {
    return addHotkey({ shift: true, key: '?' }, t('hotkey.helper'), () => {
      setOpen(true)
    })
  }, [addHotkey])

  useKeyEscape(
    () => {
      setOpen(false)
    },
    { enable: open, level: 200 },
  )

  return (
    <Modal
      open={open}
      width="auto"
      style={{ maxWidth: '1000px' }}
      onCancel={() => {
        setOpen(false)
      }}
      title={t('hotkey.title')}
      footer={false}
      zIndex={10000}
    >
      <ul className={styles.hotkeyList}>
        {orderBy(hotkeyItems, 'asc', ([key]) => key).map(
          ([, keyDescs, description], i) => (
            <li key={i}>
              <div className="keys">
                {keyDescs.map((k, j) => (
                  <kbd key={j}>{k}</kbd>
                ))}
              </div>
              <div className="desc">{description}</div>
            </li>
          ),
        )}
      </ul>
    </Modal>
  )
}
