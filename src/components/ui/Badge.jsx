import { levelStyle, categoryIcon } from '../../utils/helpers'

export function LevelBadge({ level }) {
  return (
    <span className={`badge border ${levelStyle(level)}`}>
      {level}
    </span>
  )
}

export function CategoryBadge({ category }) {
  return (
    <span className="badge bg-violet-500/10 text-violet-300 border border-violet-500/20">
      {categoryIcon(category)} {category}
    </span>
  )
}

export function FreeBadge() {
  return (
    <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      Free
    </span>
  )
}