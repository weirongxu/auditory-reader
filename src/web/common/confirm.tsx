import { useSyncedRef } from '@react-hookz/web'
import { Button, Modal, Space } from 'antd'
import { t } from 'i18next'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { useKeyEscape } from '../hooks/use-escape.js'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { globalStore } from '../store/global.js'
import { Icon } from '../components/icon.js'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

const confirmAtom = atom<null | {
  title: React.ReactNode
  description: React.ReactNode
  okCallback: () => void
}>(null)

export function uiConfirm(options: {
  title: React.ReactNode
  description: React.ReactNode
}) {
  return new Promise<void>((resolve) => {
    globalStore.set(confirmAtom, { ...options, okCallback: resolve })
  })
}

export function useConfirm() {
  const [, setConfirm] = useAtom(confirmAtom)

  const confirm = useCallback(
    (options: { title: React.ReactNode; description: React.ReactNode }) => {
      return new Promise<void>((resolve) => {
        setConfirm({ ...options, okCallback: resolve })
      })
    },
    [setConfirm],
  )

  return confirm
}

export const useConfirmHotkey = ({
  enable = true,
  onOk,
  onClose,
  level = 100,
}: {
  enable?: boolean
  onOk: () => void
  onClose?: () => void
  level?: number
}) => {
  const { addHotkey } = useHotkeys()
  const onOkRef = useSyncedRef(onOk)
  const onCloseRef = useSyncedRef(onClose)

  useEffect(() => {
    if (enable) {
      return addHotkey(
        'Enter',
        t('hotkey.ok'),
        () => {
          onOkRef.current()
        },
        { level },
      )
    }
  }, [addHotkey, enable, level, onOkRef])

  useKeyEscape(
    () => {
      onCloseRef.current?.()
    },
    { enable: !!enable && !!onClose },
  )
}

function ConfirmDialog() {
  const [confirm, setConfirm] = useAtom(confirmAtom)

  const onClose = useCallback(() => {
    setConfirm(null)
  }, [setConfirm])

  const onOk = useCallback(() => {
    confirm?.okCallback()
    onClose()
  }, [confirm, onClose])

  useConfirmHotkey({
    enable: !!confirm,
    onOk,
    onClose,
  })

  return (
    <>
      <Modal
        open={!!confirm}
        onOk={onOk}
        onCancel={onClose}
        title={
          <Space>
            <Icon icon={faQuestionCircle} size="lg" color="#ff4d4f" />
            {confirm?.title}
          </Space>
        }
        footer={false}
      >
        {confirm?.description}
        <Space>
          <Button type="primary" onClick={onClose}>
            {t('confirm.cancel')}
          </Button>
          <Button type="primary" onClick={onOk}>
            {t('confirm.ok')}
          </Button>
        </Space>
      </Modal>
    </>
  )
}

export function ConfirmProvider() {
  const [confirm] = useAtom(confirmAtom)

  if (!confirm) return <></>

  return <ConfirmDialog></ConfirmDialog>
}
