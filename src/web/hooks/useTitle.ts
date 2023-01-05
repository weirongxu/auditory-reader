import { useEffect, useState } from 'react'

export function useTitle() {
  const [title, setTitle] = useState<string>()
  useEffect(() => {
    if (!title) return
    const storedTitle = document.title
    document.title = title
    return () => {
      document.title = storedTitle
    }
  }, [title])
  return [title, setTitle] as const
}
