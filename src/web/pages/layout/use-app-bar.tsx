import { useUnmountEffect } from '@react-hookz/web'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const appBarStatesAtom = atom<{
  topLeft: React.ReactNode
  topRight: React.ReactNode
  settings: React.ReactNode
  bottomLeft1: React.ReactNode
  bottomLeft2: React.ReactNode
  bottomRight: React.ReactNode
}>({
  topLeft: null,
  topRight: null,
  settings: null,
  bottomLeft1: null,
  bottomLeft2: null,
  bottomRight: null,
})

export const useAppBarSync = ({
  topLeft,
  topRight,
  settings,
  bottomLeft1,
  bottomLeft2,
  bottomRight,
}: {
  topLeft?: React.ReactNode
  topRight?: React.ReactNode
  settings?: React.ReactNode
  bottomLeft1?: React.ReactNode
  bottomLeft2?: React.ReactNode
  bottomRight?: React.ReactNode
}) => {
  const [, setAppBarStates] = useAtom(appBarStatesAtom)

  useEffect(() => {
    setAppBarStates({
      topLeft,
      topRight,
      settings,
      bottomLeft1,
      bottomLeft2,
      bottomRight,
    })
  }, [
    topLeft,
    topRight,
    settings,
    bottomLeft1,
    bottomRight,
    setAppBarStates,
    bottomLeft2,
  ])

  useUnmountEffect(() => {
    setAppBarStates({
      topLeft: null,
      topRight: null,
      settings: null,
      bottomLeft1: null,
      bottomLeft2: null,
      bottomRight: null,
    })
  })
}
