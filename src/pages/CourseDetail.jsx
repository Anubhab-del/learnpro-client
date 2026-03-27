import { useEffect, useState }          from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import LoadingSpinner                   from '../components/ui/LoadingSpinner'
import ProgressBar                      from '../components/ui/ProgressBar'
import { LevelBadge, CategoryBadge }    from '../components/ui/Badge'
import { useProgress }                  from '../hooks/useProgress'
import api                              from '../services/api'
import { MOCK_COURSES }                 from '../data/mockData'
import { formatDuration, formatDate, formatPrice, compactNum, categoryIcon } from '../utils/helpers'

export default function CourseDetail() {
  const { id }                         = useParams()
  const { user }                       = useAuth()
  const navigate                       = useNavigate()
  const { isEnrolled, enroll, getCourseProgress } = useProgress()

  const [course,        setCourse]        = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [enrolling,     setEnrolling]     = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [tab,           setTab]           = useState('curriculum')

  const enrolled = isEnrolled(id)
  const progress = getCourseProgress(id)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/courses/${id}`)
        setCourse(res.data.course || res.data)
      } catch {
        const mock = MOCK_COURSES.find(c => c._id === id)
        setCourse(mock || MOCK_COURSES[0])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const totalLessons = course?.curriculum?.reduce(
    (s, sec) => s + (sec.lessons?.length || 0), 0
  ) || 0

  const handleEnroll = () => {
    if (!course) return
    enroll(id, totalLessons)
    navigate(`/learn/${id}`)
  }

  const handleContinue = () => navigate(`/learn/${id}`)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <LoadingSpinner size="lg" text="Loading course…" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 pt-16">
      <span className="text-6xl">😕</span>
      <h2 className="font-display font-bold text-2xl text-white">Course Not Found</h2>
      <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
    </div>
  )

  const instructorName =
    typeof course.instructor === 'string'
      ? course.instructor
      : course.instructor?.name || 'Instructor'

  const instructorBio =
    typeof course.instructor === 'object' ? course.instructor?.bio : null

  const TABS = ['curriculum', 'outcomes', 'instructor']

  return (
    <main className="min-h-screen pt-16">

      {/* ── HERO BAND ─────────────────────────── */}
      <div className="relative border-b border-white/6 overflow-hidden">
        {course.thumbnail && (
          <div className="absolute inset-0">
            <img src={course.thumbnail} alt="" aria-hidden
                 className="w-full h-full object-cover scale-110 blur-2xl opacity-12" />
            <div className="absolute inset-0 bg-gradient-to-b
                            from-ink-900/95 via-ink-900/90 to-ink-950" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-12 items-start">

            {/* Left: Course info */}
            <div className="lg:col-span-2 space-y-5 animate-fade-up">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-body"
                   style={{ color: 'var(--text-dim)' }}>
                <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-muted)' }}>{course.category}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={course.category} />
                <LevelBadge    level={course.level} />
                {course.enrollmentStatus === 'open' ? (
                  <span className="badge bg-emerald-500/15 text-emerald-400
                                   border border-emerald-500/25">
                    ✓ Open for Enrollment
                  </span>
                ) : (
                  <span className="badge bg-white/5 text-white/40 border border-white/10">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display font-extrabold text-3xl md:text-4xl
                             text-white leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              <p className="font-body text-base leading-relaxed max-w-2xl"
                 style={{ color: 'var(--text-muted)' }}>
                {course.description?.split('\n')[0]}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap gap-5 text-sm font-body"
                   style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">★</span>
                  <span className="text-white font-display font-semibold">
                    {course.rating?.toFixed(1)}
                  </span>
                  <span>({compactNum(course.totalReviews || 0)} reviews)</span>
                </span>
                <span>👥 {compactNum(course.enrolledStudents?.length || 0)} students</span>
                <span>⏱ {formatDuration(course.duration)}</span>
                <span>📅 Updated {formatDate(course.createdAt)}</span>
              </div>

              {/* Instructor line */}
              <div className="flex items-center gap-2 text-sm font-body"
                   style={{ color: 'var(--text-muted)' }}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br
                                from-violet-500 to-violet-800
                                flex items-center justify-center
                                font-display font-bold text-white text-xs">
                  {instructorName[0]?.toUpperCase()}
                </div>
                Created by
                <span className="text-violet-300 font-medium">{instructorName}</span>
              </div>

              {/* Progress if enrolled */}
              {enrolled && progress && (
                <div className="mt-2 p-4 rounded-2xl border border-emerald-500/20
                                bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold text-emerald-400 text-sm">
                      Your Progress
                    </p>
                    <span className="text-emerald-400 font-display font-bold text-sm">
                      {progress.progress}%
                    </span>
                  </div>
                  <ProgressBar value={progress.progress} showLabel={false} size="md" glow />
                  <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                    {progress.completedLessons?.length || 0} of {totalLessons} lessons completed
                  </p>
                </div>
              )}
            </div>

            {/* Right: Sticky enroll card */}
            <div className="card p-6 rounded-3xl space-y-5 shadow-player
                            lg:sticky lg:top-24 animate-fade-up opacity-0"
                 style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>

              {/* Thumbnail */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-ink-900 relative group">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title}
                       className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br
                                  from-violet-900/40 to-ink-900
                                  flex items-center justify-center text-5xl">
                    {categoryIcon(course.category)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-violet-600/90
                                  flex items-center justify-center shadow-violet-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="font-display font-extrabold text-4xl text-white">
                  {formatPrice(course.price)}
                </p>
                {course.price > 0 && (
                  <p className="font-body text-sm line-through mt-0.5"
                     style={{ color: 'var(--text-dim)' }}>
                    {formatPrice(course.price * 2)}
                  </p>
                )}
              </div>

              {/* CTA */}
              {enrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl
                                  bg-emerald-500/10 border border-emerald-500/25
                                  text-emerald-400 text-sm font-body">
                    ✅ You're enrolled in this course
                  </div>
                  {progress && (
                    <ProgressBar value={progress.progress} size="sm" />
                  )}
                  <button onClick={handleContinue}
                    className="btn btn-primary w-full justify-center py-4 text-base">
                    {progress?.progress === 100 ? '📜 Review Course' : '▶ Continue Learning'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || course.enrollmentStatus !== 'open'}
                  className={`w-full justify-center py-4 rounded-xl font-display font-bold text-base
                    transition-all duration-200
                    ${course.enrollmentStatus !== 'open'
                      ? 'bg-ink-700 text-white/30 cursor-not-allowed border border-white/8'
                      : 'btn btn-primary text-base py-4'}
                  `}
                >
                  {course.enrollmentStatus !== 'open'
                    ? '🔒 Coming Soon'
                    : course.price > 0
                      ? `Enroll — ${formatPrice(course.price)}`
                      : '🚀 Start Learning Free'}
                </button>
              )}

              {/* Perks */}
              <ul className="space-y-2.5 pt-1 border-t border-white/6">
                {[
                  `📚 ${totalLessons} lessons · ${formatDuration(course.duration)}`,
                  '♾️ Full lifetime access',
                  '📱 Works on mobile & desktop',
                  '🏆 Certificate of completion',
                  '🔒 30-day money-back guarantee',
                ].map(item => (
                  <li key={item} className="text-xs font-body flex items-start gap-2"
                      style={{ color: 'var(--text-muted)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-10">

            {/* Video preview */}
            {course.videoUrl && !enrolled && (
              <section className="animate-fade-up">
                <h2 className="font-display font-bold text-2xl text-white mb-5">
                  Free Preview
                </h2>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black
                                shadow-player">
                  <iframe
                    src={`https://www.youtube.com/embed/${course.videoUrl}`}
                    title={`${course.title} — Preview`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-ink-800 rounded-xl w-fit">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`
                    px-5 py-2.5 rounded-lg text-sm font-display font-medium
                    capitalize transition-all duration-200
                    ${tab === t
                      ? 'bg-violet-600 text-white shadow-violet-sm'
                      : 'text-white/40 hover:text-white'}
                  `}>
                  {t}
                </button>
              ))}
            </div>

            {/* Tab: Curriculum */}
            {tab === 'curriculum' && (
              <section className="space-y-3 animate-scale-in">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display font-bold text-2xl text-white">Curriculum</h2>
                  <span className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>
                    {totalLessons} lessons · {formatDuration(course.duration)}
                  </span>
                </div>

                {course.curriculum?.map((sec, i) => (
                  <div key={i} className="card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setActiveSection(activeSection === i ? -1 : i)}
                      className="w-full flex justify-between items-center p-5 text-left
                                 hover:bg-white/3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/15
                                        border border-violet-500/25
                                        flex items-center justify-center
                                        text-violet-400 font-display font-bold text-sm">
                          {i + 1}
                        </div>
                        <span className="font-display font-semibold text-white">
                          {sec.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-body"
                              style={{ color: 'var(--text-dim)' }}>
                          {sec.lessons?.length} lessons
                        </span>
                        <span className={`text-white/30 transition-transform duration-200 text-xs
                          ${activeSection === i ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>

                    {activeSection === i && (
                      <div className="border-t border-white/6 divide-y divide-white/4">
                        {sec.lessons?.map((lesson, j) => {
                          const lessonObj = typeof lesson === 'object' ? lesson : { title: lesson, id: `${i}-${j}` }
                          return (
                            <div key={j}
                                 className="flex items-center justify-between px-5 py-3.5">
                              <div className="flex items-center gap-3 text-sm font-body"
                                   style={{ color: 'var(--text-muted)' }}>
                                <span className="text-violet-500 flex-shrink-0">▶</span>
                                <span>{lessonObj.title}</span>
                              </div>
                              {lessonObj.duration && (
                                <span className="text-2xs font-body flex-shrink-0"
                                      style={{ color: 'var(--text-dim)' }}>
                                  {lessonObj.duration}m
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Enroll CTA at bottom of curriculum */}
                {!enrolled && (
                  <div className="mt-6 p-6 rounded-2xl border border-violet-500/20
                                  bg-violet-500/5 text-center">
                    <p className="font-display font-semibold text-white mb-2">
                      Ready to start learning?
                    </p>
                    <p className="font-body text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      Enroll now to get full access to all {totalLessons} lessons.
                    </p>
                    <button onClick={handleEnroll} className="btn btn-primary">
                      {course.price > 0 ? `Enroll for ${formatPrice(course.price)}` : '🚀 Enroll Free'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Tab: Outcomes */}
            {tab === 'outcomes' && (
              <section className="animate-scale-in">
                <h2 className="font-display font-bold text-2xl text-white mb-5">
                  What You'll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(course.outcomes || []).map((o, i) => (
                    <div key={i} className="card flex gap-3 p-4 rounded-xl
                                           hover:-translate-y-0.5 transition-transform">
                      <span className="text-violet-400 flex-shrink-0 mt-0.5 font-bold">✓</span>
                      <span className="font-body text-sm leading-relaxed"
                            style={{ color: 'var(--text-muted)' }}>
                        {o}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tab: Instructor */}
            {tab === 'instructor' && (
              <section className="animate-scale-in">
                <h2 className="font-display font-bold text-2xl text-white mb-5">
                  Your Instructor
                </h2>
                <div className="card p-6 rounded-2xl flex gap-5 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br
                                  from-violet-500 to-violet-800
                                  flex items-center justify-center
                                  font-display font-black text-2xl text-white flex-shrink-0">
                    {instructorName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-xl mb-1">
                      {instructorName}
                    </h3>
                    <p className="font-body text-sm leading-relaxed"
                       style={{ color: 'var(--text-muted)' }}>
                      {instructorBio || 'Expert educator with years of industry and teaching experience.'}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}