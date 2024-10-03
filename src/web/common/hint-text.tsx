import { atom, useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import styles from './hint-text.module.scss'

const hintTextAtom = atom<null | string>(null)
let timer: NodeJS.Timeout | undefined = undefined

export function useHintText() {
  const [, setHint] = useAtom(hintTextAtom)

  const openHint = useCallback(
    (
      hint: string,
      options: {
        /** seconds */
        timeout?: number
      } = {},
    ) => {
      clearTimeout(timer)
      const timeout = options.timeout ?? 3
      setHint(hint)
      timer = setTimeout(() => {
        setHint(null)
      }, timeout * 1000)
    },
    [setHint],
  )

  return useMemo(() => ({ openHint }), [openHint])
}

export function HintTextProvider() {
  const [hint] = useAtom(hintTextAtom)
  return (
    <div
      className={styles.hint}
      style={{ display: hint ? 'inline-block' : 'none' }}
    >
      {hint}
    </div>
  )
}
