import type { AlertColor } from '@mui/material'
import { createGlobalState } from 'react-hooks-global-state'

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
} = createGlobalState<{
  list: SnackbarItem[]
}>({
  list: [],
})

export function pushSnackbar(item: SnackbarItem) {
  const list = getSnackbarState('list')
  setSnackbarState('list', [...list, item])
}
