import type { AlertColor } from '@mui/material'
import { Alert, Snackbar } from '@mui/material'
import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'
import { globalStore } from '../store/global.js'

export type SnackbarItem = {
  severity?: AlertColor
  /**
   * @default 5000
   */
  duration?: number
  message: string
}

const snackbarAtom = atom<(SnackbarItem & { id: number })[]>([])
let id = 0

export function pushSnackbar(item: SnackbarItem) {
  const list = globalStore.get(snackbarAtom)
  id += 1
  globalStore.set(snackbarAtom, [...list, { ...item, id }])
}

export function SnackbarPrivider() {
  const [list, setList] = useAtom(snackbarAtom)

  const removeItem = useCallback(
    (item: SnackbarItem) => {
      setList((list) => list.filter((it) => it !== item))
    },
    [setList],
  )

  return (
    <>
      {list.map((it) => (
        <Snackbar
          key={it.id}
          open={true}
          autoHideDuration={it.duration ?? 5000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={() => removeItem(it)}
        >
          <Alert
            onClose={() => removeItem(it)}
            severity={it.severity}
            sx={{ width: '100%' }}
          >
            {it.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}
