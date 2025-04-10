import { useUnmountEffect } from '@react-hookz/web'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const appBarStatesAtom = atom<{
  topProgress: undefined | number
  topLeft: React.ReactNode
  topRight: React.ReactNode
  settings: React.ReactNode
  bottomLeft1: React.ReactNode
  bottomLeft2: React.ReactNode
  bottomRight1: React.ReactNode
  bottomRight2: React.ReactNode
}>({
  topProgress: undefined,
  topLeft: null,
  topRight: null,
  settings: null,
  bottomLeft1: null,
  bottomLeft2: null,
  bottomRight1: null,
  bottomRight2: null,
})

export const useAppBarSync = ({
  topProgress,
  topLeft,
  topRight,
  settings,
  bottomLeft1,
  bottomLeft2,
  bottomRight1,
  bottomRight2,
}: {
  topProgress?: number
  topLeft?: React.ReactNode
  topRight?: React.ReactNode
  settings?: React.ReactNode
  bottomLeft1?: React.ReactNode
  bottomLeft2?: React.ReactNode
  bottomRight1?: React.ReactNode
  bottomRight2?: React.ReactNode
}) => {
  const [, setAppBarStates] = useAtom(appBarStatesAtom)

  useEffect(() => {
    setAppBarStates({
      topProgress,
      topLeft,
      topRight,
      settings,
      bottomLeft1,
      bottomLeft2,
      bottomRight1,
      bottomRight2,
    })
  }, [
    topProgress,
    topLeft,
    topRight,
    settings,
    bottomLeft1,
    setAppBarStates,
    bottomLeft2,
    bottomRight1,
    bottomRight2,
  ])

  useUnmountEffect(() => {
    setAppBarStates({
      topProgress: undefined,
      topLeft: null,
      topRight: null,
      settings: null,
      bottomLeft1: null,
      bottomLeft2: null,
      bottomRight1: null,
      bottomRight2: null,
    })
  })
}
