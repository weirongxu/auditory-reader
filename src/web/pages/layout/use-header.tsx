import { Stack } from '@mui/material'
import { useEffect } from 'react'
import { createGlobalState } from 'react-hooks-global-state'

export const { useGlobalState: useGlboalHeaderItems } = createGlobalState<{
  title: React.ReactNode
  left: React.ReactNode
  right: React.ReactNode
  settings: React.ReactNode
}>({
  title: null,
  left: null,
  right: null,
  settings: null,
})

export function SettingLine(props: { children: React.ReactNode }) {
  return <Stack direction="row">{props.children}</Stack>
}

export const useHeaderItems = (props: {
  title?: string
  left?: React.ReactNode
  right?: React.ReactNode
  settings?: React.ReactNode
}) => {
  const [, setTitle] = useGlboalHeaderItems('title')
  const [, setLeftState] = useGlboalHeaderItems('left')
  const [, setRightState] = useGlboalHeaderItems('right')
  const [, setSettingsState] = useGlboalHeaderItems('settings')

  useEffect(() => {
    setTitle(props.title)
    setLeftState(props.left)
    setRightState(props.right)
    setSettingsState(props.settings)
    return () => {
      setTitle(null)
      setLeftState(null)
      setRightState(null)
      setSettingsState(null)
    }
  })
}
