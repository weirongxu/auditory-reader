import { useEffect } from 'react'
import { createGlobalState } from '../../hooks/createGlobalState.js'

export const { useGlobalState: useAppBarStates } = createGlobalState<{
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
  title?: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  settings?: React.ReactNode
}) => {
  const { title, left, right, settings } = props
  const [, setAppBarStates] = useAppBarStates()

  useEffect(() => {
    setAppBarStates({
      title,
      left,
      right,
      settings,
    })

    return () => {
      setAppBarStates({
        title: null,
        left: null,
        right: null,
        settings: null,
      })
    }
  }, [title, left, right, settings, setAppBarStates])
}
