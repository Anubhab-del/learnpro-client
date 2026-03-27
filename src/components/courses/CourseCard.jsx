import { Link } from 'react-router-dom'
import { formatDuration, formatPrice, truncate, categoryIcon, compactNum } from '../../utils/helpers'
import { LevelBadge } from '../ui/Badge'
import { useProgress } from '../../hooks/useProgress'
import ProgressBar from '../ui/ProgressBar'

export default function CourseCard({ course, index = 0 }) {
  const {
    _id, title, description, instructor,
    category, duration, level, thumbnail,
    price = 0, rating = 4.5, totalReviews = 0,
    enrolledStudents = [],
  } = course

  const { getCourseProgress, isEnrolled } = useProgress()
  const progress  = getCourseProgress(_id)
  const enrolled  = isEnrolled(_id)

  const instructorName =
    typeof instructor === 'string' ? instructor : instructor?.name || 'Instructor'

  const delay = `${(index % 6) * 80}ms`

  return (
    <Link
      to={`/courses/${_id}`}
      className="block animate-fade-up opacity-0"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <article className="card-interactive h-full flex flex-col overflow-hidden group relative">

        {/* ── Enrolled ribbon ─────────────────── */}
        {enrolled && (
          <div className="absolute top-3 left-3 z-10">
            <span className="badge bg-emerald-500/90 text-white border-0 shadow-emerald-sm backdrop-blur-sm">
              ✓ Enrolled
            </span>
          </div>
        )}

        {/* ── Thumbnail ───────────────────────── */}
        <div className="relative aspect-video overflow-hidden bg-ink-900 flex-shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.07]
                         transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center
                            bg-gradient-to-br from-violet-900/30 to-ink-900">
              <span className="text-5xl opacity-60">{categoryIcon(category)}</span>
            </div>
          )}

          {/* Gradient overlay — stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t
                          from-ink-900/80 via-ink-900/20 to-transparent" />

          {/* Price chip */}
          <div className="absolute top-3 right-3">
            {price === 0 ? (
              <span className="badge bg-emerald-500/90 text-white border-0 shadow-lg backdrop-blur-sm">
                Free
              </span>
            ) : (
              <span className="badge bg-ink-950/80 text-white border border-white/15 backdrop-blur-sm">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {/* Bottom category chip */}
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-ink-950/75 text-white/75
                             border border-white/10 backdrop-blur-sm text-2xs">
              {categoryIcon(category)} {category}
            </span>
          </div>

          {/* Hover play overlay */}
          <div className="absolute inset-0 flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-violet-600/90 backdrop-blur-sm
                            flex items-center justify-center shadow-violet-lg
                            scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────── */}
        <div className="flex flex-col flex-1 p-5">

          {/* Level + Rating */}
          <div className="flex items-center justify-between mb-3">
            <LevelBadge level={level} />
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-sm">★</span>
              <span className="text-white font-display font-semibold text-sm">
                {rating.toFixed(1)}
              </span>
              <span className="text-2xs" style={{ color: 'var(--text-dim)' }}>
                ({compactNum(totalReviews)})
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-white text-base leading-snug mb-2
                         group-hover:text-violet-300 transition-colors duration-200">
            {truncate(title, 65)}
          </h3>

          {/* Description */}
          <p className="font-body text-sm leading-relaxed flex-1 mb-4"
             style={{ color: 'var(--text-muted)' }}>
            {truncate(description?.split('\n')[0], 85)}
          </p>

          {/* Progress bar if enrolled */}
          {enrolled && progress && (
            <div className="mb-4">
              <ProgressBar value={progress.progress} size="sm" showLabel={false} />
              <p className="text-2xs mt-1 font-body" style={{ color: 'var(--text-dim)' }}>
                {progress.progress === 100
                  ? '✅ Completed'
                  : `${progress.completedLessons?.length || 0} / ${progress.totalLessons || '?'} lessons done`}
              </p>
            </div>
          )}

          {/* Footer meta */}
          <div className="pt-3 border-t border-white/6 flex items-center justify-between
                          text-xs" style={{ color: 'var(--text-dim)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800
                              flex items-center justify-center text-white font-display font-bold
                              text-2xs flex-shrink-0">
                {instructorName[0]?.toUpperCase()}
              </div>
              <span className="truncate max-w-[90px] font-body">{instructorName}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 font-body">
              <span>⏱ {formatDuration(duration)}</span>
              <span>👥 {compactNum(enrolledStudents.length)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}