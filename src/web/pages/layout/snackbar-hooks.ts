import type { AlertColor } from '@mui/material'
import { atom } from 'jotai'
import { globalStore } from '../../store/global.js'

export type SnackbarItem = {
  severity?: AlertColor
  /**
   * @default 5000
   */
  duration?: number
  message: string
}

export const snackbarAtom = atom<SnackbarItem[]>([])

export function pushSnackbar(item: SnackbarItem) {
  const list = globalStore.get(snackbarAtom)
  globalStore.set(snackbarAtom, [...list, item])
}
