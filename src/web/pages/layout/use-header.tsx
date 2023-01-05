import { Stack } from '@mui/material'
import { useEffect } from 'react'
import { createGlobalState } from 'react-hooks-global-state'

export const { useGlobalState: useGlboalHeaderItems } = createGlobalState<{
  left: React.ReactNode
  right: React.ReactNode
  settings: React.ReactNode
}>({
  left: null,
  right: null,
  settings: null,
})

export function SettingLine(props: { children: React.ReactNode }) {
  return <Stack direction="row">{props.children}</Stack>
}

export const useHeaderItems = (props: {
  left?: React.ReactNode
  right?: React.ReactNode
  settings?: React.ReactNode
}) => {
  const [, setLeftState] = useGlboalHeaderItems('left')
  const [, setRightState] = useGlboalHeaderItems('right')
  const [, setSettingsState] = useGlboalHeaderItems('settings')

  useEffect(() => {
    setLeftState(props.left)
    setRightState(props.right)
    setSettingsState(props.settings)
    return () => {
      setLeftState(null)
      setRightState(null)
      setSettingsState(null)
    }
  })
}
