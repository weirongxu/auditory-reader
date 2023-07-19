import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  styled,
} from '@mui/material'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useKeyEscape } from '../hooks/useEscape.js'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { t } from 'i18next'

const confirmAtom = atom<null | {
  title: React.ReactNode
  description: React.ReactNode
  okCallback: () => void
}>(null)

export function useConfirm() {
  const [, setConfirm] = useAtom(confirmAtom)

  const confirm = useCallback(
    (options: { title: React.ReactNode; description: React.ReactNode }) => {
      return new Promise<void>((resolve) => {
        setConfirm({ ...options, okCallback: resolve })
      })
    },
    [setConfirm]
  )

  return confirm
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}))

function ConfirmDialog() {
  const [confirm, setConfirm] = useAtom(confirmAtom)
  const { addHotkey } = useHotkeys()

  const onClose = useCallback(() => {
    setConfirm(null)
  }, [setConfirm])

  const onOk = useCallback(() => {
    confirm?.okCallback()
    onClose()
  }, [confirm, onClose])

  useEffect(() => {
    if (confirm) {
      return addHotkey(
        'Enter',
        t('hotkey.ok'),
        () => {
          onOk()
        },
        { level: 100 }
      )
    }
  }, [addHotkey, confirm, onClose, onOk])

  useKeyEscape(() => {
    onClose()
  })

  return (
    <>
      <BootstrapDialog open={!!confirm} onClose={onClose}>
        <DialogTitle sx={{ m: 0, p: 2 }}>{confirm?.title}</DialogTitle>
        <DialogContent dividers>{confirm?.description}</DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('confirm.cancel')}</Button>
          <Button onClick={onOk}>{t('confirm.ok')}</Button>
        </DialogActions>
      </BootstrapDialog>
    </>
  )
}

export function ConfirmProvider() {
  const [confirm] = useAtom(confirmAtom)

  if (!confirm) return <></>

  return <ConfirmDialog></ConfirmDialog>
}
