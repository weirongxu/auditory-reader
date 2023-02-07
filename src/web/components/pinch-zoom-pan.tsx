import styles from './pinch-zoom-pan.module.scss'
import { create } from 'pinch-zoom-pan'
import { useEffect, useRef } from 'react'
import { useKeyEscape } from '../hooks/useEscape.js'

interface PinchZoomPanProps {
  min?: number
  max?: number
  captureWheel?: boolean
  onClose?: () => void
  children: React.ReactNode
}

export function PinchZoomPan({
  min,
  max,
  captureWheel,
  onClose,
  children,
}: PinchZoomPanProps) {
  const refRoot = useRef<HTMLDivElement>(null)

  useKeyEscape(() => onClose?.())

  useEffect(() => {
    const element = refRoot.current
    if (!element) return
    return create({ element, minZoom: min, maxZoom: max, captureWheel })
  }, [min, max, captureWheel])

  return (
    <div
      ref={refRoot}
      className={styles.root}
      onClick={(event) => {
        if (event.target === refRoot.current) onClose?.()
      }}
      onKeyDown={(event) => {
        if (event.key.toLowerCase() === 'escape') onClose?.()
      }}
    >
      <div className={styles.point}>
        <div className={styles.canvas}>{children}</div>
      </div>
    </div>
  )
}
