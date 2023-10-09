import { Alert } from '@mui/material'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { useEffect } from 'react'
import { t } from 'i18next'
import { useNavigate } from 'react-router-dom'

export function NotFound({ title }: { title: string }) {
  const nav = useNavigate()
  const { addHotkeys } = useHotkeys()

  // hotkey
  useEffect(() => {
    return addHotkeys([['u', t('hotkey.goBack'), () => nav('../../')]])
  }, [addHotkeys, nav])

  return (
    <Alert title={`The ${title} not found`} severity="error">
      The {title} not found
    </Alert>
  )
}
