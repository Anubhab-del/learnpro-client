import { useState, useMemo }   from 'react'
import { Link }                from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import LoadingSpinner          from '../components/ui/LoadingSpinner'
import ProgressBar             from '../components/ui/ProgressBar'
import EmptyState              from '../components/ui/EmptyState'
import { LevelBadge }          from '../components/ui/Badge'
import { useProgress }         from '../hooks/useProgress'
import { MOCK_COURSES }        from '../data/mockData'
import { formatDate, formatDuration, categoryIcon } from '../utils/helpers'

const TABS = ['in-progress', 'completed', 'all']

export default function Dashboard() {
  const { user }             = useAuth()
  const { getEnrollments, getCourseProgress } = useProgress()
  const [activeTab, setActiveTab] = useState('in-progress')

  /* Build enriched enrollment list from localStorage progress + mock course data */
  const enrollments = useMemo(() => {
    const raw = getEnrollments()
    return raw.map(e => {
      const course = MOCK_COURSES.find(c => c._id === e.courseId)
      return course ? { ...e, course } : null
    }).filter(Boolean)
  }, [getEnrollments])

  const {
    inProgress, completed, totalHours, avgProgress,
  } = useMemo(() => {
    const inP  = enrollments.filter(e => (e.progress || 0)  < 100)
    const comp = enrollments.filter(e => (e.progress || 0) === 100)
    const hrs  = enrollments.reduce((s, e) =>
      s + ((e.course?.duration || 0) / 60), 0)
    const avg  = enrollments.length
      ? Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length)
      : 0
    return { inProgress: inP, completed: comp, totalHours: Math.round(hrs), avgProgress: avg }
  }, [enrollments])

  const STATS = [
    { icon: '📚', value: enrollments.length,  label: 'Enrolled',       color: 'text-violet-400' },
    { icon: '✅', value: completed.length,    label: 'Completed',      color: 'text-emerald-400' },
    { icon: '⏱',  value: `${totalHours}h`,   label: 'Hours Learned',  color: 'text-amber-400'  },
    { icon: '📈', value: `${avgProgress}%`,   label: 'Avg Progress',   color: 'text-cyan-400'   },
  ]

  const displayList =
    activeTab === 'in-progress' ? inProgress :
    activeTab === 'completed'   ? completed  :
    enrollments

  const tabCount = (t) =>
    t === 'in-progress' ? inProgress.length :
    t === 'completed'   ? completed.length  :
    enrollments.length

  return (
    <main className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between
                        gap-5 mb-12 animate-fade-up">
          <div>
            <p className="section-eyebrow mb-2">Your Learning Space</p>
            <h1 className="section-title mb-2">
              Welcome back,{' '}
              <span className="text-gradient-violet">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="section-subtitle">
              {inProgress.length > 0
                ? `You have ${inProgress.length} course${inProgress.length !== 1 ? 's' : ''} in progress. Keep going!`
                : 'Start a course to begin your learning journey.'}
            </p>
          </div>
          <Link to="/courses" className="btn btn-primary flex-shrink-0">
            + Explore Courses
          </Link>
        </div>

        {/* ── Stats ───────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 stagger-children">
          {STATS.map(s => (
            <div key={s.label}
              className="card p-6 rounded-2xl group hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <p className={`font-display font-extrabold text-3xl ${s.color} mb-1`}>
                {s.value}
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Overall progress bar ──────────── */}
        {enrollments.length > 0 && (
          <div className="card p-6 rounded-2xl mb-10 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white">Overall Progress</h2>
              <span className={`font-display font-bold text-sm
                ${avgProgress === 100 ? 'text-emerald-400' : 'text-violet-300'}`}>
                {avgProgress}% average
              </span>
            </div>
            <ProgressBar value={avgProgress} size="lg" showLabel={false} glow />
            <p className="font-body text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
              {avgProgress === 0
                ? 'Jump into a course and start making progress!'
                : avgProgress < 50
                  ? 'Great start — keep the momentum going!'
                  : avgProgress < 80
                    ? 'Over halfway there — you are on a roll!'
                    : avgProgress < 100
                      ? 'Almost done — the finish line is in sight!'
                      : '🏆 Perfect score — you have completed all your courses!'}
            </p>
          </div>
        )}

        {/* ── Tabs ────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-ink-800 rounded-xl w-fit mb-8">
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`
                px-5 py-2.5 rounded-lg text-sm font-display font-medium
                capitalize transition-all duration-200 flex items-center gap-2
                ${activeTab === t
                  ? 'bg-violet-600 text-white shadow-violet-sm'
                  : 'text-white/40 hover:text-white'}
              `}>
              {t.replace('-', ' ')}
              <span className={`px-1.5 py-0.5 rounded-full text-2xs
                ${activeTab === t ? 'bg-white/20' : 'bg-white/8'}`}>
                {tabCount(t)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Course List ─────────────────────── */}
        {displayList.length === 0 ? (
          <EmptyState
            icon={activeTab === 'completed' ? '🏆' : '🎯'}
            title={activeTab === 'completed' ? 'No completed courses yet' : 'No courses in progress'}
            subtitle={
              activeTab === 'completed'
                ? 'Finish a course to earn your first certificate.'
                : 'Enroll in a course and start watching lessons to track progress here.'
            }
            action={<Link to="/courses" className="btn btn-primary">Browse Courses</Link>}
          />
        ) : (
          <div className="space-y-4">
            {displayList.map((enrollment, i) => {
              const course = enrollment.course
              if (!course) return null

              const instructorName =
                typeof course.instructor === 'string'
                  ? course.instructor
                  : course.instructor?.name || 'Instructor'
              const isDone = (enrollment.progress || 0) === 100
              const totalL = enrollment.totalLessons || 0
              const doneL  = enrollment.completedLessons?.length || 0

              return (
                <div key={`${enrollment.courseId}-${i}`}
                  className="card-interactive p-5 rounded-2xl
                             flex flex-col sm:flex-row gap-5 items-start
                             animate-fade-up opacity-0"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>

                  {/* Thumbnail */}
                  <Link to={`/courses/${course._id}`} className="flex-shrink-0 w-full sm:w-auto">
                    <div className="w-full sm:w-48 h-28 rounded-xl overflow-hidden
                                    bg-ink-900 relative group">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title}
                          className="w-full h-full object-cover
                                     group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br
                                        from-violet-900/30 to-ink-900
                                        flex items-center justify-center text-4xl">
                          {categoryIcon(course.category)}
                        </div>
                      )}
                      {isDone && (
                        <div className="absolute inset-0 bg-emerald-500/20
                                        flex items-center justify-center">
                          <span className="text-3xl">🏆</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link to={`/courses/${course._id}`}
                          className="font-display font-bold text-white
                                     hover:text-violet-300 transition-colors
                                     text-lg leading-tight line-clamp-1">
                          {course.title}
                        </Link>
                        <p className="font-body text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-1"
                           style={{ color: 'var(--text-dim)' }}>
                          <span>👤 {instructorName}</span>
                          <span>·</span>
                          <LevelBadge level={course.level} />
                          <span>·</span>
                          <span>⏱ {formatDuration(course.duration)}</span>
                        </p>
                      </div>

                      {/* Action button */}
                      <Link
                        to={isDone ? `/courses/${course._id}` : `/learn/${course._id}`}
                        className={`btn flex-shrink-0 btn-sm
                          ${isDone ? 'btn-ghost' : 'btn-primary'}`}
                      >
                        {isDone ? '📜 Review' : '▶ Continue'}
                      </Link>
                    </div>

                    {/* Progress */}
                    <div>
                      <ProgressBar
                        value={enrollment.progress || 0}
                        size="sm"
                        showLabel={false}
                      />
                      <p className="text-2xs font-body mt-1.5"
                         style={{ color: 'var(--text-dim)' }}>
                        {isDone
                          ? `✅ Completed · ${formatDate(enrollment.completedAt || enrollment.lastActivity)}`
                          : enrollment.progress > 0
                            ? `${doneL} of ${totalL} lessons · ${enrollment.progress}% done`
                            : 'Not started yet — click Continue to begin'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}