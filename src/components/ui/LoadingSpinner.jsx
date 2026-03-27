export default function LoadingSpinner({ size = 'md', text = '', fullscreen = false }) {
  const ring = {
    sm: 'w-6  h-6  border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-3',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`
        ${ring[size]} rounded-full
        border-violet-900
        border-t-violet-400
        animate-spin
      `} />
      {text && (
        <p className="text-sm font-body animate-pulse-soft" style={{ color: 'var(--text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}