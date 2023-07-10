import { useEffect, useRef } from 'react'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { t } from 'i18next'

export function useKeyEscape(
  callback: () => void,
  options: { enable?: boolean; level?: number } = {}
) {
  const { enable = true, level = 100 } = options
  const refCallback = useRef(callback)
  const { addHotkey } = useHotkeys()

  useEffect(() => {
    refCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (enable) {
      return addHotkey(
        'escape',
        t('hotkey.escape'),
        () => {
          refCallback.current()
        },
        { level }
      )
    }
  }, [addHotkey, enable, level])
}
