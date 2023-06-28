import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

export const defaultTitle = 'Auditory Reader'

const titleAtom = atom<string | null>(null)

export function useTitle() {
  const [title, setTitle] = useAtom(titleAtom)

  useEffect(() => {
    if (!title) return
    const storedTitle = document.title
    document.title = `${title}: ${defaultTitle}`
    return () => {
      document.title = storedTitle
    }
  }, [title])

  return [title, setTitle] as const
}
