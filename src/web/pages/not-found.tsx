import { Alert } from 'antd'
import { t } from 'i18next'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHotkeys } from '../hotkey/hotkey-state.js'

export function NotFound({ title }: { title: string }) {
  const nav = useNavigate()
  const { addHotkeys } = useHotkeys()

  // hotkey
  useEffect(() => {
    return addHotkeys([['u', t('hotkey.goBack'), () => nav('../../')]])
  }, [addHotkeys, nav])

  return (
    <Alert
      type="error"
      message={`The ${title} not found`}
      description={`The ${title} not found`}
    ></Alert>
  )
}
