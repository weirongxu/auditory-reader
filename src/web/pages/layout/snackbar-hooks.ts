import type { AlertColor } from '@mui/material'
import { createGlobalState } from '../../hooks/createGlobalState.js'

export type SnackbarItem = {
  severity?: AlertColor
  /**
   * @default 5000
   */
  duration?: number
  message: string
}

export const {
  useGlobalState: useSnackbarState,
  getGlobalState: getSnackbarState,
  setGlobalState: setSnackbarState,
} = createGlobalState<SnackbarItem[]>([])

export function pushSnackbar(item: SnackbarItem) {
  const list = getSnackbarState()
  setSnackbarState([...list, item])
}
