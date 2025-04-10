export function AppBarProgress({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${progress * 100}%`,
        background: 'var(--main-bg-highlight)',
        pointerEvents: 'none',
      }}
    ></div>
  )
}
