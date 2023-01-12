import { useEffect } from 'react'
import { createGlobalState } from 'react-hooks-global-state'

export const { useGlobalState: useAppBarState } = createGlobalState<{
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

export const useAppBarSync = (props: {
  title?: string
  left?: React.ReactNode
  right?: React.ReactNode
  settings?: React.ReactNode
}) => {
  const [, setTitle] = useAppBarState('title')
  const [, setLeftState] = useAppBarState('left')
  const [, setRightState] = useAppBarState('right')
  const [, setSettingsState] = useAppBarState('settings')

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
