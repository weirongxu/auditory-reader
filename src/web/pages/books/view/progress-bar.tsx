import type { Player } from './player.js'

export function ViewProgressBar({
  player,
  scrollPercent,
}: {
  player: Player
  scrollPercent: number | undefined
}) {
  let progress = '0'
  if (scrollPercent) progress = scrollPercent.toFixed(2)

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
        player.iframeCtrler.scrollPercent(percent, true).catch(console.error)
      }}
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
