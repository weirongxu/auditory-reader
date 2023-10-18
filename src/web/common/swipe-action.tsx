import { useEffect, useRef, type CSSProperties, useState } from 'react'

type SwipeAction = {
  width: number
  trigger: () => void
}

function mountSwipe(
  element: HTMLElement,
  {
    left,
    leftElement,
    right,
    rightElement,
  }: {
    left?: SwipeAction
    leftElement?: HTMLDivElement
    right?: SwipeAction
    rightElement?: HTMLDivElement
  },
) {
  if (!left && !right) return

  let start: { x: number; y: number } | null = null
  let curX: number | null = null

  const getXY = (event: TouchEvent) => {
    const { clientX, clientY } = event.touches[0]
    return [clientX, clientY]
  }

  const onStart = (event: TouchEvent) => {
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    curX = 0
  }

  const onMove = (event: TouchEvent) => {
    if (!start) return
    const [x, y] = getXY(event)
    const oX = x - start.x
    const dX = Math.abs(oX)
    const oY = y - start.y
    const dY = Math.abs(oY)
    if (dY > 30) return
    if (dX > 5) {
      event.stopPropagation()
      event.preventDefault()
    }
    if (left && leftElement && oX > 0) {
      const mX = Math.min(dX, left.width + 10)
      curX = mX
      element.style.transform = `translateX(${mX}px)`
      leftElement.style.opacity = dX > left.width ? '1' : '0.5'
    } else if (right && rightElement && oX < 0) {
      const mX = Math.min(dX, right.width + 10)
      curX = -mX
      element.style.transform = `translateX(${-mX}px)`
      rightElement.style.opacity = dX > right.width ? '1' : '0.5'
    }
  }

  const onEnd = () => {
    if (!start) return
    start = null

    element.style.transform = ''
    if (leftElement) leftElement.style.opacity = '0'
    if (rightElement) rightElement.style.opacity = '0'

    if (!curX) return
    if (left && curX > left.width) {
      left.trigger()
    } else if (right && rightElement && curX < -right.width) {
      right.trigger()
    }
    curX = null
  }

  element.addEventListener('touchstart', onStart)
  element.addEventListener('touchmove', onMove)
  element.addEventListener('touchend', onEnd)

  return () => {
    element.removeEventListener('touchstart', onStart)
    element.removeEventListener('touchmove', onMove)
    element.removeEventListener('touchend', onEnd)
  }
}

const getNodeStyle = (
  node: {
    color?: string
    background?: string
    node: React.ReactNode
  } & SwipeAction,
): CSSProperties => ({
  position: 'absolute',
  top: 0,
  width: node.width + 10,
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: node.color ?? 'var(--main-fg-blue)',
  background: node.background ?? 'var(--main-bg-blue)',
  opacity: 0,
})

export function SwipeAction({
  children,
  left,
  right,
}: {
  children: React.ReactNode
  left?: {
    color?: string
    background?: string
    node: React.ReactNode
  } & SwipeAction
  right?: {
    color?: string
    background?: string
    node: React.ReactNode
  } & SwipeAction
}) {
  const refElement = useRef<HTMLDivElement>(null)
  const [leftElement, setLeftElement] = useState<HTMLDivElement>()
  const [rightElement, setRightElement] = useState<HTMLDivElement>()

  useEffect(() => {
    if (!refElement.current) return
    return mountSwipe(refElement.current, {
      left,
      leftElement,
      right,
      rightElement,
    })
  }, [left, leftElement, right, rightElement])

  return (
    <div
      style={{
        position: 'relative',
        willChange: 'transform',
      }}
      ref={refElement}
    >
      {left && (
        <div
          ref={(element) => setLeftElement(element ?? undefined)}
          className="swipe-left-node"
          style={{
            ...getNodeStyle(left),
            right: '100%',
          }}
        >
          {left.node}
        </div>
      )}
      {children}
      {right && (
        <div
          ref={(element) => setRightElement(element ?? undefined)}
          className="swipe-right-node"
          style={{
            ...getNodeStyle(right),
            left: '100%',
          }}
        >
          {right.node}
        </div>
      )}
    </div>
  )
}
