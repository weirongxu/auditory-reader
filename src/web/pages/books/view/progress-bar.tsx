import type { PageScrollPercent } from './player-states.js'

export function ViewProgressBar({
  scrollPercent,
  onClick,
}: {
  scrollPercent: PageScrollPercent | undefined
  onClick?: (percent: number) => void
}) {
  const percent = scrollPercent?.percent.toFixed(2) ?? '0'
  const progress = scrollPercent?.progress ?? '0'
  const length = scrollPercent?.length ?? '0'

  return (
    <div
      style={{
        height: 6,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 6,
        background: 'var(--main-bg-active)',
        position: 'relative',
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const percent = (event.clientX - rect.left) / rect.width
        onClick?.(percent)
      }}
      title={`${percent}%`}
    >
      <div
        style={{
          position: 'absolute',
          transition: 'width,left 0.2s',
          left: `${progress}%`,
          width: `${length}%`,
          height: '100%',
          background: 'var(--main-fg-active)',
        }}
      ></div>
    </div>
  )
}
