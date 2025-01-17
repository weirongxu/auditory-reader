import { useUnmountEffect } from '@react-hookz/web'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const appBarStatesAtom = atom<{
  topLeft: React.ReactNode
  topRight: React.ReactNode
  settings: React.ReactNode
  bottomLeft1: React.ReactNode
  bottomLeft2: React.ReactNode
  bottomRight1: React.ReactNode
  bottomRight2: React.ReactNode
}>({
  topLeft: null,
  topRight: null,
  settings: null,
  bottomLeft1: null,
  bottomLeft2: null,
  bottomRight1: null,
  bottomRight2: null,
})

export const useAppBarSync = ({
  topLeft,
  topRight,
  settings,
  bottomLeft1,
  bottomLeft2,
  bottomRight1,
  bottomRight2,
}: {
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
      topLeft,
      topRight,
      settings,
      bottomLeft1,
      bottomLeft2,
      bottomRight1,
      bottomRight2,
    })
  }, [
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
