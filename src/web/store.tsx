import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { BookTypes } from '../core/book/types.js'
import type { TtsProviderId, VoiceMeta } from '../core/tts/index.js'
import { registry } from '../core/tts/index.js'
import { orderBy } from '../core/util/collection.js'

function createStore<T>(options: {
  storeKey: string
  read: (value: string | null) => T
  write: (value: T) => string | null
}) {
  const { storeKey, read, write } = options
  const getOriginStoredValue = () => localStorage.getItem(storeKey)
  const initAtom = atom(read(getOriginStoredValue()))

  const pipeAtom = atom(
    (get) => get(initAtom),
    (get, set, value: T | ((prev: T) => T)) => {
      const newValue =
        typeof value === 'function'
          ? (value as (prev: T) => T)(get(initAtom))
          : value
      set(initAtom, newValue)
      const writeValue = write(newValue)
      if (writeValue) localStorage.setItem(storeKey, writeValue)
      else localStorage.removeItem(storeKey)
    },
  )
  return () => useAtom(pipeAtom)
}

export type ViewPanelType = 'none' | 'nav' | 'annotation' | 'keyword'
const limitViewPanelType = (v: string | null): ViewPanelType =>
  v === 'nav' || v === 'annotation' || v === 'keyword' ? v : 'none'

export const useViewPanelType = createStore<ViewPanelType>({
  storeKey: 'viewPanelType',
  read: limitViewPanelType,
  write: limitViewPanelType,
})

const limitTtsProviderId = (v: string | null): TtsProviderId =>
  v === 'webSpeech' ? v : (registry.list()[0]?.id ?? 'webSpeech')

export const useTtsProviderId = createStore<TtsProviderId>({
  storeKey: 'ttsProviderId',
  read: limitTtsProviderId,
  write: (v) => v,
})

/**
 * Dict[provider][book-lang] = voiceId
 */
const useTtsVoiceDict = createStore<
  Partial<Record<TtsProviderId, Record<string, string>>>
>({
  storeKey: 'ttsVoiceDict',
  read: (s) => {
    if (s) return JSON.parse(s)
    const legacy = localStorage.getItem('langVoiceURIDict')
    if (!legacy) return {}
    return { webSpeech: JSON.parse(legacy) }
  },
  write: (d) => JSON.stringify(d),
})

export const useTtsVoices = (providerId: TtsProviderId): VoiceMeta[] => {
  const provider = registry.get(providerId)
  const [voices, setVoices] = useState(() => provider?.getVoices() ?? [])

  useEffect(() => {
    if (!provider) return
    return provider.onVoicesChange(() => setVoices(provider.getVoices()))
  }, [provider])

  return voices
}

const sortVoices = (voices: VoiceMeta[], langCode: string): VoiceMeta[] =>
  orderBy(voices, 'desc', (v) => [
    v.lang.startsWith(`${langCode}-`),
    !v.localService,
  ])

export const useVoiceForBook = () => {
  const [providerId] = useTtsProviderId()
  const [voiceDict] = useTtsVoiceDict()
  const voices = useTtsVoices(providerId)

  return useCallback(
    (book: BookTypes.Entity): VoiceMeta | null => {
      const sorted = sortVoices(voices, book.langCode)
      const voiceId = voiceDict[providerId]?.[book.langCode]
      const voice = voiceId
        ? (sorted.find((v) => v.voiceId === voiceId) ?? null)
        : null
      return voice ?? sorted[0] ?? null
    },
    [voices, voiceDict, providerId],
  )
}

export const useVoice = (book: BookTypes.Entity) => {
  const [providerId] = useTtsProviderId()
  const voices = useTtsVoices(providerId)
  const [voiceDict, setVoiceDict] = useTtsVoiceDict()

  const sortedVoices = useMemo(
    () => sortVoices(voices, book.langCode),
    [voices, book.langCode],
  )

  const voiceId = voiceDict[providerId]?.[book.langCode] ?? null
  const voice = useMemo(
    () =>
      voiceId
        ? (sortedVoices.find((v) => v.voiceId === voiceId) ?? null)
        : null,
    [voiceId, sortedVoices],
  )
  const finalVoice = voice ?? sortedVoices[0] ?? null

  const setVoice = useCallback(
    (next: VoiceMeta | null) => {
      const nextDict = { ...voiceDict }
      const providerDict = { ...(nextDict[providerId] ?? {}) }
      if (next) providerDict[book.langCode] = next.voiceId
      else delete providerDict[book.langCode]
      nextDict[providerId] = providerDict
      setVoiceDict(nextDict)
    },
    [providerId, book.langCode, voiceDict, setVoiceDict],
  )

  return {
    voice: finalVoice,
    setVoice,
    voices: sortedVoices,
    providerId,
  }
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

export const usePanelExpanded = createStore<boolean>({
  storeKey: 'panelExpanded',
  read: (v) => v === '1',
  write: (v) => (v ? '1' : '0'),
})
