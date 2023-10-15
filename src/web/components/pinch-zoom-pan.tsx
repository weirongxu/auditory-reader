import { useEffect, useRef } from 'react'
import { useKeyEscape } from '../hooks/useEscape.js'
import styles from './pinch-zoom-pan.module.scss'

interface PinchZoomPanProps {
  onClose?: () => void
  children: React.ReactNode
}

function getTouchesPageCenter(event: TouchEvent) {
  const [a, b] = Array.from(event.touches)
  return {
    pageX: (a.pageX + b.pageX) / 2,
    pageY: (a.pageY + b.pageY) / 2,
  }
}

const getTouchesDistance = (event: TouchEvent) => {
  const [a, b] = Array.from(event.touches)
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

const getWheelRate = (event: WheelEvent) => {
  const delta = event.deltaY
  return delta === 0 ? 0 : delta < 0 ? 1.1 : 0.9
}

const stopEvent = (event: Event) => {
  event.stopPropagation()
  event.preventDefault()
}

const mountPinchZoomPan = (
  overlay: HTMLElement,
  container: HTMLElement,
  onClick: () => void,
) => {
  let moved = false
  let action:
    | { type: 'pinch'; range: number }
    | { type: 'move'; x: number; y: number }
    | null = null
  const overlayRect = overlay.getBoundingClientRect()
  const current = {
    x: overlayRect.left + overlayRect.width / 2,
    y: overlayRect.top + overlayRect.height / 2,
    scale: 1,
  }
  const cumulative = { ...current }

  const setTransform = () => {
    container.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`
  }

  setTransform()

  const move = (offset: { x: number; y: number }) => {
    if (Math.hypot(offset.x, offset.y) >= 10) moved = true
    current.x = cumulative.x + offset.x
    current.y = cumulative.y + offset.y
    setTransform()
  }

  const scale = (offset: { pageX: number; pageY: number; rate: number }) => {
    const scale = cumulative.scale * offset.rate
    if (scale < 0.01) return
    current.scale = scale
    const rect = overlay.getBoundingClientRect()
    const offsetX = offset.pageX - rect.left - cumulative.x
    const offsetY = offset.pageY - rect.top - cumulative.y
    current.x = cumulative.x + offsetX * (1 - offset.rate)
    current.y = cumulative.y + offsetY * (1 - offset.rate)
    setTransform()
  }

  const onEnd = () => {
    cumulative.x = current.x
    cumulative.y = current.y
    cumulative.scale = current.scale
  }

  // touch
  overlay.addEventListener('touchstart', (event) => {
    stopEvent(event)
    if (event.touches.length >= 2)
      action = {
        type: 'pinch',
        range: getTouchesDistance(event),
      }
    else
      action = {
        type: 'move',
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    moved = false
  })
  overlay.addEventListener('touchmove', (event) => {
    stopEvent(event)
    if (!action) return
    if (action.type === 'move') {
      const touch = event.touches[0]
      move({
        x: touch.clientX - action.x,
        y: touch.clientY - action.y,
      })
    } else if (action.type === 'pinch') {
      scale({
        ...getTouchesPageCenter(event),
        rate: getTouchesDistance(event) / action.range,
      })
    }
  })
  overlay.addEventListener('touchend', (event) => {
    stopEvent(event)
    if (!action) return
    if (action.type === 'move' && !moved) onClick()
    action = null
    onEnd()
  })

  // mouse
  overlay.addEventListener('mousedown', (event) => {
    stopEvent(event)
    action = {
      type: 'move',
      x: event.clientX,
      y: event.clientY,
    }
    moved = false
  })
  overlay.addEventListener('mousemove', (event) => {
    stopEvent(event)
    if (!action) return
    if (action.type === 'move') {
      move({
        x: event.clientX - action.x,
        y: event.clientY - action.y,
      })
    }
  })
  overlay.addEventListener('mouseup', (event) => {
    stopEvent(event)
    if (!action) return
    if (action.type === 'move' && !moved) onClick()
    action = null
    onEnd()
    if (!moved) onClick()
  })
  overlay.addEventListener('wheel', (event) => {
    stopEvent(event)
    scale({
      pageX: event.pageX,
      pageY: event.pageY,
      rate: getWheelRate(event),
    })
    onEnd()
  })
}

export function PinchZoomPan({ onClose, children }: PinchZoomPanProps) {
  const refOverlay = useRef<HTMLDivElement>(null)
  const refContainer = useRef<HTMLDivElement>(null)
  const refOnClose = useRef<() => void>()
  useKeyEscape(() => refOnClose.current?.())

  useEffect(() => {
    refOnClose.current = onClose
  }, [onClose])

  useEffect(() => {
    const overlay = refOverlay.current
    const container = refContainer.current
    if (!overlay || !container) return
    return mountPinchZoomPan(overlay, container, () => refOnClose.current?.())
  }, [])

  return (
    <div
      ref={refOverlay}
      className={styles.overlay}
      onKeyDown={(event) => {
        if (event.key.toLowerCase() === 'escape') refOnClose.current?.()
      }}
    >
      <div className={styles.container} ref={refContainer}>
        <div className={styles.center}>{children}</div>
      </div>
    </div>
  )
}
