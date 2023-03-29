import { useEffect } from 'react'
import { createGlobalState } from '../../hooks/createGlobalState.js'

export const { useGlobalState: useAppBarStates } = createGlobalState<{
  isIdle: boolean
  title: React.ReactNode
  topLeft: React.ReactNode
  topRight: React.ReactNode
  settings: React.ReactNode
  bottomLeft: React.ReactNode
  bottomRight: React.ReactNode
}>({
  isIdle: true,
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
      isIdle: false,
      title,
      topLeft,
      topRight,
      settings,
      bottomLeft,
      bottomRight,
    })

    return () => {
      setAppBarStates({
        isIdle: true,
        title: null,
        topLeft: null,
        topRight: null,
        settings: null,
        bottomLeft: null,
        bottomRight: null,
      })
    }
  }, [
    title,
    topLeft,
    topRight,
    settings,
    bottomLeft,
    bottomRight,
    setAppBarStates,
  ])
}
