export default function ProgressBar({ percentage = 0, showLabel = false, height = 'h-2' }) {
  const clamped = Math.min(Math.max(Math.round(percentage), 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white/50">Progress</span>
          <span className="text-xs font-bold text-purple-400">{clamped}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-white/10 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)'
          }}
        />
      </div>
    </div>
  );
}
