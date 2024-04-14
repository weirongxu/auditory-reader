import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useId } from 'react'

export const defaultTitle = 'Auditory Reader'

const titleStackAtom = atom<{ id: string; title: string }[]>([])
const titleAtom = atom<string | undefined>((get) => {
  const titleStack = get(titleStackAtom)
  const titleItem = titleStack.at(0)
  return titleItem?.title
})

export function useTitle() {
  const [title] = useAtom(titleAtom)
  return title
}

export function TitleProvider() {
  const title = useTitle()
  useEffect(() => {
    if (!title) return
    document.title = `${title}: ${defaultTitle}`
  }, [title])
  return <></>
}

export function usePushTitle() {
  const id = useId()
  const [, setTitleStack] = useAtom(titleStackAtom)

  // pop titles
  useEffect(() => {
    return () => {
      setTitleStack((stack) => stack.filter((item) => id !== item.id))
    }
  }, [id, setTitleStack])

  // push title
  const pushTitle = useCallback(
    (title: string) => {
      setTitleStack((stack) => [{ title, id }, ...stack])
    },
    [id, setTitleStack],
  )

  return pushTitle
}
