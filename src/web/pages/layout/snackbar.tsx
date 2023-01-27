import { Alert, Snackbar } from '@mui/material'
import { useCallback } from 'react'
import type { SnackbarItem } from './snackbar-hooks.js'
import { useSnackbarState } from './snackbar-hooks.js'

export function GlobalSnackbar() {
  const [list, setList] = useSnackbarState('list')

  const removeItem = useCallback(
    (item: SnackbarItem) => {
      setList(list.filter((it) => it !== item))
    },
    [list, setList]
  )

  return (
    <>
      {list.map((it, index) => (
        <Snackbar
          key={index}
          open={true}
          autoHideDuration={it.duration ?? 5000}
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
