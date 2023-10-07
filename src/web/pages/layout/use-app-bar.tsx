import { useUnmountEffect } from '@react-hookz/web'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const appBarStatesAtom = atom<{
  topLeft: React.ReactNode
  topRight: React.ReactNode
  settings: React.ReactNode
  bottomLeft: React.ReactNode
  bottomRight: React.ReactNode
}>({
  topLeft: null,
  topRight: null,
  settings: null,
  bottomLeft: null,
  bottomRight: null,
})

export const useAppBarSync = ({
  topLeft,
  topRight,
  settings,
  bottomLeft,
  bottomRight,
}: {
  topLeft?: React.ReactNode
  topRight?: React.ReactNode
  settings?: React.ReactNode
  bottomLeft?: React.ReactNode
  bottomRight?: React.ReactNode
}) => {
  const [, setAppBarStates] = useAtom(appBarStatesAtom)

  useEffect(() => {
    setAppBarStates({
      topLeft,
      topRight,
      settings,
      bottomLeft,
      bottomRight,
    })
  }, [topLeft, topRight, settings, bottomLeft, bottomRight, setAppBarStates])

  useUnmountEffect(() => {
    setAppBarStates({
      topLeft: null,
      topRight: null,
      settings: null,
      bottomLeft: null,
      bottomRight: null,
    })
  })
}
