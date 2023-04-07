import { useUnmountEffect } from '@react-hookz/web'
import { useEffect } from 'react'
import { createGlobalState } from '../../hooks/createGlobalState.js'

export const { useGlobalState: useAppBarStates } = createGlobalState<{
  title: React.ReactNode
  topLeft: React.ReactNode
  topRight: React.ReactNode
  settings: React.ReactNode
  bottomLeft: React.ReactNode
  bottomRight: React.ReactNode
}>({
  title: null,
  topLeft: null,
  topRight: null,
  settings: null,
  bottomLeft: null,
  bottomRight: null,
})

export const useAppBarSync = (props: {
  title?: React.ReactNode
  topLeft?: React.ReactNode
  topRight?: React.ReactNode
  settings?: React.ReactNode
  bottomLeft?: React.ReactNode
  bottomRight?: React.ReactNode
}) => {
  const { title, topLeft, topRight, settings, bottomLeft, bottomRight } = props
  const [, setAppBarStates] = useAppBarStates()

  useEffect(() => {
    setAppBarStates({
      title,
      topLeft,
      topRight,
      settings,
      bottomLeft,
      bottomRight,
    })
  }, [
    title,
    topLeft,
    topRight,
    settings,
    bottomLeft,
    bottomRight,
    setAppBarStates,
  ])

  useUnmountEffect(() => {
    setAppBarStates({
      title: null,
      topLeft: null,
      topRight: null,
      settings: null,
      bottomLeft: null,
      bottomRight: null,
    })
  })
}
