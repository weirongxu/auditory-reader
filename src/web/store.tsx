import { atom, useAtom } from 'jotai'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useMemo } from 'react'
import type { BookTypes } from '../core/book/types.js'
import { orderBy } from '../core/util/collection.js'
import { globalStore } from './store/global.js'
import { isBrowser } from '../core/util/browser.js'

const allVoicesAtom = atom<SpeechSynthesisVoice[]>([])
if (isBrowser) {
  const loadVoices = () => {
    globalStore.set(allVoicesAtom, speechSynthesis.getVoices())
  }
  loadVoices()
  if ('addEventListener' in window.speechSynthesis) {
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
      [inner, setInner],
    )
    return [inner, setValue]
  }
}

export type ViewPanelType = 'none' | 'nav' | 'annotation' | 'keyword'
const limitViewPanelType = (v: string | null): ViewPanelType =>
  v === 'nav' || v === 'annotation' || v === 'keyword' ? v : 'none'

export const useViewPanelType = createStore<ViewPanelType>({
  storeKey: 'viewPanelType',
  read: limitViewPanelType,
  write: limitViewPanelType,
})

/**
 * Dict[book-lang] = voiceURI
 */
const useLangVoiceURIDict = createStore<Record<string, string>>({
  storeKey: 'langVoiceURIDict',
  read: (uriDictStr) => (uriDictStr ? JSON.parse(uriDictStr) : {}),
  write: (uriDict) => JSON.stringify(uriDict),
})

export const useGetVoice = () => {
  const [dict] = useLangVoiceURIDict()
  const [allVoices] = useAtom(allVoicesAtom)

  const getAllSortedVoices = useCallback(
    (book: BookTypes.Entity) => {
      return orderBy(allVoices, 'desc', (v) => [
        v.lang.startsWith(`${book.langCode}-`),
        !v.localService,
      ])
    },
    [allVoices],
  )

  const getVoice = useCallback(
    (book: BookTypes.Entity) => {
      const allSortedVoices = getAllSortedVoices(book)
      const uri = dict[book.langCode]
      const voice = uri ? allSortedVoices.find((v) => v.voiceURI === uri) : null
      return voice ?? allSortedVoices.at(0) ?? null
    },
    [dict, getAllSortedVoices],
  )

  return { getVoice, getAllSortedVoices }
}

const useLangVoiceURI = (book: BookTypes.Entity) => {
  const [dict, setDict] = useLangVoiceURIDict()

  const langURI = useMemo<string | null>(
    () => dict[book.langCode] ?? null,
    [book.langCode, dict],
  )

  const setLangURI = useCallback(
    (langURI: string | null) => {
      const newDict = { ...dict }
      if (langURI) newDict[book.langCode] = langURI
      else delete newDict[book.langCode]
      setDict(newDict)
    },
    [book.langCode, dict, setDict],
  )

  return [langURI, setLangURI] as const
}

export const useVoice = (book: BookTypes.Entity) => {
  const [langVoiceURI, setLangVoiceURI] = useLangVoiceURI(book)
  const { getAllSortedVoices, getVoice } = useGetVoice()

  const allSortedVoices = useMemo(() => {
    return getAllSortedVoices(book)
  }, [book, getAllSortedVoices])

  const voiceURI = useMemo((): string | null => {
    return langVoiceURI ?? allSortedVoices[0]?.voiceURI ?? null
  }, [allSortedVoices, langVoiceURI])

  const setVoiceURI = useCallback(
    (voiceURI: string | null) => {
      setLangVoiceURI(voiceURI)
    },
    [setLangVoiceURI],
  )

  const voice = useMemo(() => {
    return getVoice(book) ?? null
  }, [book, getVoice])

  const setVoice = useCallback(
    (voice: SpeechSynthesisVoice | null) => {
      setVoiceURI(voice?.voiceURI ?? null)
    },
    [setVoiceURI],
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

export const COLOR_SCHEMES = ['dark', 'light'] as const
export type ColorScheme = (typeof COLOR_SCHEMES)[number]
export const USER_COLOR_SCHEMES = ['system', ...COLOR_SCHEMES] as const
export type UserColorscheme = (typeof USER_COLOR_SCHEMES)[number]

export const useUserColorScheme = createStore<UserColorscheme>({
  storeKey: 'userColorScheme',
  read: (v) => (v ?? 'system') as UserColorscheme,
  write: (v) => v,
})

export const useParagraphRepeat = createStore<number>({
  storeKey: 'paragraphRepeat',
  read: (v) => (v ? Number(v) : 1),
  write: (v) => v.toString(),
})

export const SPLIT_PAGE_TYPES = ['none', 'auto', 'single', 'double'] as const
export type PageListType = (typeof SPLIT_PAGE_TYPES)[number]

export const usePageList = createStore<PageListType>({
  storeKey: 'pageList',
  read: (v) =>
    SPLIT_PAGE_TYPES.includes(v as PageListType) ? (v as PageListType) : 'auto',
  write: (v) => v,
})

export const useFontSize = createStore<number>({
  storeKey: 'fontSize',
  read: (v) => (v ? Math.min(Math.max(Number(v), 8), 30) : 16),
  write: (v) => v.toString(),
})

export const useDisabledVertical = createStore<boolean>({
  storeKey: 'disabledVertical',
  read: (v) => (v ? v === '1' : false),
  write: (v) => (v ? '1' : '0'),
})
