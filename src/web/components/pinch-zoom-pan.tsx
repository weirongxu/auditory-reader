import { useEffect, useRef } from 'react'
import { useKeyEscape } from '../hooks/use-escape.js'
import * as styles from './pinch-zoom-pan.module.scss'
import { eventBan } from '../../core/util/dom.js'
import { useHotkeys } from '../hotkey/hotkey-state.js'
import { t } from 'i18next'

interface PinchZoomPanProps {
  onClose?: () => void
  children: React.ReactNode
}

function getTouchesPageCenter(a: Touch, b: Touch) {
  return {
    pageX: (a.pageX + b.pageX) / 2,
    pageY: (a.pageY + b.pageY) / 2,
  }
}

function getTouchesDistance(a: Touch, b: Touch) {
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function getRectCenter(rect: DOMRect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

const getWheelRate = (event: WheelEvent) => {
  const delta = event.deltaY
  return delta === 0 ? 0 : delta < 0 ? 1.1 : 0.9
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

  let current = {
    x: 0,
    y: 0,
    scale: 1,
  }
  let cumulative = {
    x: 0,
    y: 0,
    scale: 1,
  }

  const setTransform = () => {
    container.style.transform = `translate(${current.x}px, ${current.y}px) scale(${current.scale})`
  }

  const resetState = () => {
    current = {
      ...getRectCenter(overlayRect),
      scale: 1,
    }
    cumulative = { ...current }
    setTransform()
  }

  resetState()

  const moving = (offset: { x: number; y: number }) => {
    if (Math.hypot(offset.x, offset.y) >= 10) moved = true
    current.x = cumulative.x + offset.x
    current.y = cumulative.y + offset.y
    setTransform()
  }

  const scaling = (offset: { pageX: number; pageY: number; rate: number }) => {
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

  const touchEnd = () => {
    cumulative.x = current.x
    cumulative.y = current.y
    cumulative.scale = current.scale
  }

  const disposes: (() => void)[] = []

  function addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  ): void {
    overlay.addEventListener(type, listener)
    disposes.push(() => overlay.removeEventListener(type, listener))
  }

  // touch
  addEventListener('touchstart', (event) => {
    eventBan(event)
    const touch1 = event.touches[0]
    if (!touch1) return
    const touch2 = event.touches[1]
    if (touch2)
      action = {
        type: 'pinch',
        range: getTouchesDistance(touch1, touch2),
      }
    else
      action = {
        type: 'move',
        x: touch1.clientX,
        y: touch1.clientY,
      }
    moved = false
  })
  addEventListener('touchmove', (event) => {
    eventBan(event)
    if (!action) return
    const touch1 = event.touches[0]
    if (!touch1) return
    const touch2 = event.touches[1]
    switch (action.type) {
      case 'move': {
        moving({
          x: touch1.clientX - action.x,
          y: touch1.clientY - action.y,
        })
        break
      }
      case 'pinch': {
        if (touch2)
          scaling({
            ...getTouchesPageCenter(touch1, touch2),
            rate: getTouchesDistance(touch1, touch2) / action.range,
          })
        break
      }
    }
  })
  addEventListener('touchend', (event) => {
    eventBan(event)
    if (!action) return
    if (action.type === 'move' && !moved) onClick()
    action = null
    touchEnd()
  })

  // mouse
  addEventListener('mousedown', (event) => {
    eventBan(event)
    action = {
      type: 'move',
      x: event.clientX,
      y: event.clientY,
    }
    moved = false
  })
  addEventListener('mousemove', (event) => {
    eventBan(event)
    if (!action) return
    if (action.type === 'move') {
      moving({
        x: event.clientX - action.x,
        y: event.clientY - action.y,
      })
    }
  })
  addEventListener('mouseup', (event) => {
    eventBan(event)
    if (!action) return
    if (action.type === 'move' && !moved) onClick()
    action = null
    touchEnd()
    if (!moved) onClick()
  })
  addEventListener('wheel', (event) => {
    eventBan(event)
    scaling({
      pageX: event.pageX,
      pageY: event.pageY,
      rate: getWheelRate(event),
    })
    touchEnd()
  })

  const dispose = () => {
    disposes.forEach((dispose) => dispose())
  }

  return {
    move: (offset: { x: number; y: number }) => {
      moving(offset)
      touchEnd()
    },
    scale: (offset: { rate: number }) => {
      const center = getRectCenter(overlayRect)
      scaling({
        ...offset,
        pageX: center.x,
        pageY: center.y,
      })
      touchEnd()
    },
    reset: () => {
      resetState()
    },
    dispose,
  }
}

export function PinchZoomPan({ onClose, children }: PinchZoomPanProps) {
  const refOverlay = useRef<HTMLDivElement>(null)
  const refContainer = useRef<HTMLDivElement>(null)
  const refOnClose = useRef<() => void>()
  const { addHotkeys } = useHotkeys()
  useKeyEscape(() => refOnClose.current?.())

  useEffect(() => {
    refOnClose.current = onClose
  }, [onClose])

  useEffect(() => {
    const overlay = refOverlay.current
    const container = refContainer.current
    if (!overlay || !container) return
    const {
      move,
      scale,
      reset,
      dispose: disposePinch,
    } = mountPinchZoomPan(overlay, container, () => refOnClose.current?.())

    const up = () => {
      move({ x: 0, y: -10 })
    }
    const down = () => {
      move({ x: 0, y: 10 })
    }
    const left = () => {
      move({ x: -10, y: 0 })
    }
    const right = () => {
      move({ x: 10, y: 0 })
    }
    const zoomIn = () => {
      scale({ rate: 1.1 })
    }
    const zoomOut = () => {
      scale({ rate: 0.9 })
    }

    const disposeHotkeys = addHotkeys(
      [
        ['k', t('hotkey.pinchUp'), up],
        ['j', t('hotkey.pinchDown'), down],
        ['h', t('hotkey.pinchLeft'), left],
        ['l', t('hotkey.pinchRight'), right],
        ['ArrowUp', t('hotkey.pinchUp'), up],
        ['ArrowDown', t('hotkey.pinchDown'), down],
        ['ArrowLeft', t('hotkey.pinchLeft'), left],
        ['ArrowRight', t('hotkey.pinchRight'), right],
        ['=', t('hotkey.pinchZoomIn'), zoomIn],
        ['-', t('hotkey.pinchZoomOut'), zoomOut],
        ['Backspace', t('hotkey.pinchReset'), reset],
      ],
      {
        level: 100,
      },
    )

    return () => {
      disposePinch()
      disposeHotkeys()
    }
  }, [addHotkeys])

  useEffect(() => {}, [addHotkeys])

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
