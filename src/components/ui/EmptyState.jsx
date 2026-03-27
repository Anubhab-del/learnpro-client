export default function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-6xl mb-5 animate-float">{icon}</div>
      <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
      {subtitle && (
        <p className="section-subtitle max-w-sm mb-6">{subtitle}</p>
      )}
      {action && action}
    </div>
  )
}