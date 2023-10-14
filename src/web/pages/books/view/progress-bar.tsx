import type { Player } from './player.js'

export function ViewProgressBar({
  player,
  scrollPercent,
}: {
  player: Player
  scrollPercent: number | undefined
}) {
  const progress = scrollPercent?.toFixed(2) ?? '0'

  return (
    <div
      style={{
        height: 8,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 8,
        background: 'var(--main-bg-active)',
      }}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const percent = (event.clientX - rect.left) / rect.width
        player.iframeCtrler.scrollToPercent(percent, true).catch(console.error)
      }}
      title={`${progress}%`}
    >
      <div
        style={{
          transition: 'width 0.2s',
          width: `${progress}%`,
          height: '100%',
          background: 'var(--main-fg-active)',
        }}
      ></div>
    </div>
  )
}
