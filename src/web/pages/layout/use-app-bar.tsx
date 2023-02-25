import { useMountEffect } from '@react-hookz/web'
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
  const [, setAppBarState] = useAppBarStates()

  useMountEffect(() => {
    setAppBarState({
      title: null,
      left: null,
      right: null,
      settings: null,
      ...props,
    })

    return () => {
      setAppBarState({
        title: null,
        left: null,
        right: null,
        settings: null,
      })
    }
  })
}
