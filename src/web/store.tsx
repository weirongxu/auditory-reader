import { isBrowser } from '@react-hookz/web/cjs/util/const'
import { atom, useAtom } from 'jotai'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo } from 'react'
import type { BookTypes } from '../core/book/types.js'
import { orderBy } from '../core/util/collection.js'
import { globalStore } from './store/global.js'

const allVoicesAtom = atom<SpeechSynthesisVoice[]>([])
if (isBrowser) {
  const loadVoices = () => {
    globalStore.set(allVoicesAtom, speechSynthesis.getVoices())
  }
  loadVoices()
  if (window.speechSynthesis.addEventListener) {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
  }
}

function createStore<T>(options: {
  storeKey: string
  read: (value: string | null) => T
  write: (value: T) => string | null
}): () => [T, Dispatch<SetStateAction<T>>] {
  const { storeKey, read, write } = options
  const getOriginStoredValue = () => localStorage.getItem(storeKey)
  const globalAtom = atom(read(getOriginStoredValue()))

  return () => {
    const [inner, setInner] = useAtom(globalAtom)
    const setValue: Dispatch<SetStateAction<T>> = useCallback(
      (getValue: SetStateAction<T>): void => {
        let value: T
        if (typeof getValue === 'function') {
          value = (getValue as any)(inner)
        } else {
          value = getValue
        }
        setInner(value)
        const writeValue = write(value)
        if (writeValue) localStorage.setItem(storeKey, writeValue)
        else localStorage.removeItem(storeKey)
      },
      [inner, setInner]
    )
    return [inner, setValue]
  }
}

export type ViewPanelType = 'none' | 'nav' | 'bookmark'
const limitViewPanelType = (v: string | null): ViewPanelType =>
  v === 'nav' || v === 'bookmark' ? v : 'none'

export const useViewPanelType = createStore<ViewPanelType>({
  storeKey: 'viewPanelType',
  read: limitViewPanelType,
  write: limitViewPanelType,
})

const useLastVoiceURIDict = createStore<Record<string, string>>({
  storeKey: 'voiceURILastDict',
  read: (uriDictStr) => (uriDictStr ? JSON.parse(uriDictStr) : {}),
  write: (uriDict) => JSON.stringify(uriDict),
})

const useLastVoiceURI = (book: BookTypes.Entity) => {
  const [dict, setDict] = useLastVoiceURIDict()

  const lastURI = useMemo(
    () => dict[book.langCode] ?? null,
    [book.langCode, dict]
  )

  const setLastURI = useCallback(
    (lastURI: string | null) => {
      const newDict = { ...dict }
      if (lastURI) newDict[book.langCode] = lastURI
      else delete newDict[book.langCode]
      setDict(newDict)
    },
    [book.langCode, dict, setDict]
  )

  return [lastURI, setLastURI] as const
}

const useVoiceURLDict = createStore<Record<string, string>>({
  storeKey: 'voiceURIDict',
  read: (voiceURIStr) => (voiceURIStr ? JSON.parse(voiceURIStr) : {}),
  write: (voiceURIDict) => JSON.stringify(voiceURIDict),
})

export const useVoice = (book: BookTypes.Entity) => {
  const [dict, setDict] = useVoiceURLDict()
  const [lastVoiceURI, setLastVoiceURI] = useLastVoiceURI(book)
  const [allVoices] = useAtom(allVoicesAtom)

  const allSortedVoices = useMemo(() => {
    return orderBy(allVoices, 'desc', (v) => [
      v.lang.startsWith(`${book.langCode}-`),
      !v.localService,
    ])
  }, [allVoices, book.langCode])

  const voiceURI = useMemo((): string | null => {
    return dict[book.uuid] ?? lastVoiceURI ?? allSortedVoices[0]?.voiceURI
  }, [allSortedVoices, book.uuid, lastVoiceURI, dict])

  const setVoiceURI = useCallback(
    (voiceURI: string | null) => {
      const newDict = { ...dict }
      if (voiceURI) newDict[book.uuid] = voiceURI
      else delete dict[book.uuid]
      setDict(newDict)
      setLastVoiceURI(voiceURI)
    },
    [book.uuid, dict, setDict, setLastVoiceURI]
  )

  const voice = useMemo(() => {
    return (
      (voiceURI
        ? allSortedVoices.find((v) => v.voiceURI === voiceURI)
        : null) ??
      allSortedVoices[0] ??
      null
    )
  }, [allSortedVoices, voiceURI])

  const setVoice = useCallback(
    (voice: SpeechSynthesisVoice | null) => {
      setVoiceURI(voice?.voiceURI ?? null)
    },
    [setVoiceURI]
  )

  return { voiceURI, setVoiceURI, voice, setVoice, allSortedVoices }
}

export const useAutoSection = createStore<boolean>({
  storeKey: 'autoSection',
  read: (v) => (v ? v === '1' : true),
  write: (v) => (v ? '1' : '0'),
})

export const useStopTimer = createStore<boolean>({
  storeKey: 'stopTimer',
  read: (v) => (v ? v === '1' : true),
  write: (v) => (v ? '1' : '0'),
})

export const useStopTimerSeconds = createStore<number>({
  storeKey: 'stopTimerSeconds',
  read: (v) => (v ? Number(v) : 30 * 60),
  write: (v) => v.toString(),
})

export const usePersonReplace = createStore<boolean>({
  storeKey: 'personReplace',
  read: (v) => (v ? v === '1' : false),
  write: (v) => (v ? '1' : '0'),
})

export const useSpeechSpeed = createStore<number>({
  storeKey: 'speechSpeed',
  read: (v) => (v ? Number(v) : 1),
  write: (v) => v.toString(),
})

export const COLOR_SCHEMES = ['system', 'dark', 'light'] as const
export type ColorScheme = (typeof COLOR_SCHEMES)[number]

export const useUserColorScheme = createStore<ColorScheme>({
  storeKey: 'userColorScheme',
  read: (v) => (v ?? 'system') as ColorScheme,
  write: (v) => v,
})

export const useParagraphRepeat = createStore<number>({
  storeKey: 'paragraphRepeat',
  read: (v) => (v ? Number(v) : 1),
  write: (v) => v.toString(),
})

export const SPLIT_PAGE_TYPES = ['none', 'auto', 'single', 'double'] as const
export type SplitPageType = (typeof SPLIT_PAGE_TYPES)[number]

export const useSplitPage = createStore<SplitPageType>({
  storeKey: 'splitPage',
  read: (v) =>
    SPLIT_PAGE_TYPES.includes(v as SplitPageType)
      ? (v as SplitPageType)
      : 'auto',
  write: (v) => v,
})
