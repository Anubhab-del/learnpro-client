import { useState }   from 'react'
import { Link }       from 'react-router-dom'
import {
  formatDuration, formatPrice, truncate,
  categoryIcon, compactNum,
} from '../../utils/helpers'
import { LevelBadge }  from '../ui/Badge'
import { useProgress } from '../../hooks/useProgress'
import ProgressBar     from '../ui/ProgressBar'

const CATEGORY_GRADIENTS = {
  'Web Development': 'from-blue-900/60   via-blue-800/40   to-ink-900',
  'AI & ML':         'from-violet-900/60 via-violet-800/40 to-ink-900',
  'Data Science':    'from-emerald-900/60 via-emerald-800/40 to-ink-900',
  'UI/UX Design':    'from-pink-900/60   via-pink-800/40   to-ink-900',
  'Mobile Dev':      'from-orange-900/60 via-orange-800/40 to-ink-900',
  'DevOps':          'from-cyan-900/60   via-cyan-800/40   to-ink-900',
  'Cloud Computing': 'from-sky-900/60    via-sky-800/40    to-ink-900',
  'Cybersecurity':   'from-red-900/60    via-red-800/40    to-ink-900',
}

function CourseThumbnail({ thumbnail, title, category }) {
  const [errored, setErrored] = useState(false)
  const gradient = CATEGORY_GRADIENTS[category] || 'from-violet-900/60 via-violet-800/40 to-ink-900'

  if (!thumbnail || errored) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center
                       bg-gradient-to-br ${gradient} gap-3`}>
        <span style={{ fontSize:'clamp(2.5rem, 6vw, 3.5rem)' }}>
          {categoryIcon(category)}
        </span>
        <p className="font-display font-semibold text-white/60 text-center px-3 leading-tight"
           style={{ fontSize:'clamp(0.65rem, 1.5vw, 0.75rem)' }}>
          {truncate(title, 40)}
        </p>
      </div>
    )
  }

  return (
    <img
      src={thumbnail}
      alt={title}
      loading="lazy"
      onError={() => setErrored(true)}
      className="w-full h-full object-cover group-hover:scale-[1.07]
                 transition-transform duration-700 ease-out"
    />
  )
}

export default function CourseCard({ course, index = 0 }) {
  const {
    _id, title, description, instructor,
    category, duration, level, thumbnail,
    price = 0, rating = 4.5, totalReviews = 0,
    enrolledStudents = [],
  } = course

  const { getCourseProgress, isEnrolled } = useProgress()
  const progress = getCourseProgress(_id)
  const enrolled = isEnrolled(_id)

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

        {enrolled && (
          <div className="absolute top-3 left-3 z-10">
            <span className="badge bg-emerald-500/90 text-white border-0 shadow-lg backdrop-blur-sm">
              ✓ Enrolled
            </span>
          </div>
        )}

        {/* Thumbnail */}
        <div className="relative overflow-hidden bg-ink-900 flex-shrink-0"
             style={{ aspectRatio:'16/9' }}>
          <CourseThumbnail
            thumbnail={thumbnail}
            title={title}
            category={category}
          />

          <div className="absolute inset-0 bg-gradient-to-t
                          from-ink-900/80 via-ink-900/10 to-transparent pointer-events-none" />

          <div className="absolute top-3 right-3 z-10">
            {price === 0 ? (
              <span className="badge bg-emerald-500/90 text-white border-0 shadow-lg backdrop-blur-sm">
                Free
              </span>
            ) : (
              <span className="badge bg-ink-950/85 text-white border border-white/20 backdrop-blur-sm">
                {formatPrice(price)}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-4rem)]">
            <span className="badge bg-ink-950/80 text-white/80
                             border border-white/10 backdrop-blur-sm truncate block">
              {categoryIcon(category)} {category}
            </span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <div className="w-14 h-14 rounded-full bg-violet-600/90 backdrop-blur-sm
                            flex items-center justify-center shadow-violet-lg
                            scale-75 group-hover:scale-100 transition-transform duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 md:p-5">

          <div className="flex items-center justify-between mb-3 gap-2">
            <LevelBadge level={level} />
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-amber-400" style={{ fontSize:'clamp(0.75rem, 2vw, 0.875rem)' }}>★</span>
              <span className="text-white font-display font-semibold"
                    style={{ fontSize:'clamp(0.75rem, 2vw, 0.875rem)' }}>
                {rating.toFixed(1)}
              </span>
              <span style={{ fontSize:'clamp(0.65rem, 1.5vw, 0.75rem)', color:'var(--text-dim)' }}>
                ({compactNum(totalReviews)})
              </span>
            </div>
          </div>

          <h3 className="font-display font-bold text-white leading-snug mb-2
                         group-hover:text-violet-300 transition-colors duration-200"
              style={{ fontSize:'clamp(0.9rem, 2vw, 1.0625rem)' }}>
            {truncate(title, 65)}
          </h3>

          <p className="font-body leading-relaxed flex-1 mb-3"
             style={{ fontSize:'clamp(0.8rem, 2vw, 0.875rem)', color:'var(--text-muted)' }}>
            {truncate(description?.split('\n')[0], 90)}
          </p>

          {enrolled && progress && (
            <div className="mb-3">
              <ProgressBar value={progress.progress} size="sm" showLabel={false} />
              <p className="font-body mt-1"
                 style={{ fontSize:'clamp(0.65rem, 1.5vw, 0.75rem)', color:'var(--text-dim)' }}>
                {progress.progress === 100
                  ? '✅ Completed'
                  : `${progress.completedLessons?.length || 0}/${progress.totalLessons || '?'} lessons`}
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-white/6 flex items-center justify-between gap-2"
               style={{ fontSize:'clamp(0.7rem, 1.5vw, 0.8rem)', color:'var(--text-dim)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="rounded-lg bg-gradient-to-br from-violet-600 to-violet-800
                              flex items-center justify-center text-white font-display font-bold flex-shrink-0"
                   style={{ width:'1.5rem', height:'1.5rem', fontSize:'0.625rem', minWidth:'1.5rem' }}>
                {instructorName[0]?.toUpperCase()}
              </div>
              <span className="truncate font-body">{instructorName}</span>
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