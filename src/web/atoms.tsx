import { atom } from 'jotai'

export const iframeWinAtom = atom<{ win: Window | null }>({ win: null })
