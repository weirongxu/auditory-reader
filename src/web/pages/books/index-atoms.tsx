import { atom, useAtom } from 'jotai'
import type { SortOrder } from '../../../core/book/enums.js'
import { useCallback, type SetStateAction } from 'react'

const pageAtom = atom(1)

export const perPageAtom = atom(15)
export const activatedIndexAtom = atom(0)
export const archivedAtom = atom(false)
export const favoritedAtom = atom(false)
export const searchAtom = atom('')
export const orderAtom = atom<SortOrder>('default')

export const usePage = () => {
  const [page, setPage] = useAtom(pageAtom)
  const [, setActivatedIndex] = useAtom(activatedIndexAtom)
  const goPage = useCallback(
    (action: SetStateAction<number>) => {
      setActivatedIndex(0)
      setPage(action)
    },
    [setActivatedIndex, setPage],
  )
  return [page, goPage] as const
}
