import { useEffect, useRef } from 'react'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { t } from 'i18next'

export function useKeyEscape(callback: () => void) {
  const refCallback = useRef(callback)
  const { addHotkey } = useHotkeys()

  useEffect(() => {
    refCallback.current = callback
  }, [callback])

  useEffect(() => {
    return addHotkey(
      'escape',
      t('hotkey.escape'),
      () => {
        refCallback.current()
      },
      { level: 100 }
    )
  }, [addHotkey])
}
