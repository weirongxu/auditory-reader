import type { PageScrollPercent } from './player-states.js'
import type { Player } from './player.js'

export function ViewProgressBar({
  player,
  scrollPercent,
}: {
  player: Player
  scrollPercent: PageScrollPercent | undefined
}) {
  const percent = scrollPercent?.percent.toFixed(2) ?? '0'
  const progress = scrollPercent?.progress ?? '0'
  const length = scrollPercent?.length ?? '0'

  return (
    <div
      style={{
        height: 8,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 8,
        background: 'var(--main-bg-active)',
        position: 'relative',
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const percent = (event.clientX - rect.left) / rect.width
        player.iframeCtrler.scrollToPercent(percent, true).catch(console.error)
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
