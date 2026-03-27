export default function ProgressBar({ value = 0, showLabel = true, size = 'md', animated = true }) {
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

  const clamped = Math.min(100, Math.max(0, value))

  const color =
    clamped === 100  ? 'from-emerald-500 to-emerald-400' :
    clamped >= 60    ? 'from-violet-500  to-violet-400'  :
    clamped >= 30    ? 'from-violet-600  to-amber-400'   :
                       'from-violet-700  to-violet-500'

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-2xs font-display font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-dim)' }}>
            Progress
          </span>
          <span className={`text-xs font-display font-bold ${clamped === 100 ? 'text-emerald-400' : 'text-violet-300'}`}>
            {clamped}%
          </span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-ink-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}