import { useEffect, useState }          from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import LoadingSpinner                   from '../components/ui/LoadingSpinner'
import ProgressBar                      from '../components/ui/ProgressBar'
import { LevelBadge, CategoryBadge }    from '../components/ui/Badge'
import { useProgress }                  from '../hooks/useProgress'
import { redirectToStripeCheckout }     from '../services/stripe'
import api                              from '../services/api'
import { MOCK_COURSES }                 from '../data/mockData'
import {
  formatDuration, formatDate, formatPrice,
  compactNum, categoryIcon,
} from '../utils/helpers'

export default function CourseDetail() {
  const { id }      = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const { isEnrolled, syncEnroll, getCourseProgress } = useProgress()

  const [course,        setCourse]        = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError,   setActionError]   = useState('')
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
        setCourse(MOCK_COURSES.find(c => c._id === id) || MOCK_COURSES[0])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const totalLessons = course?.curriculum?.reduce(
    (s, sec) => s + (sec.lessons?.length || 0), 0
  ) || 0

  /* ── Free enrollment ─────────────────────── */
  const handleEnrollFree = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })
      return
    }
    setActionLoading(true)
    setActionError('')
    try {
      await syncEnroll(id, totalLessons)
      navigate(`/learn/${id}`)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Enrollment failed. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  /* ── Paid enrollment via Stripe ──────────── */
  const handlePaid = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })
      return
    }
    setActionLoading(true)
    setActionError('')
    try {
      /*
       * Step 1: Ask our backend to create a Stripe Checkout Session.
       * Backend returns { success, sessionId, url }
       * The url is a full Stripe-hosted checkout URL like:
       * https://checkout.stripe.com/c/pay/cs_test_...
       */
      const res = await api.post('/payment/create-session', { courseId: id })

      if (!res.data.success || !res.data.url) {
        throw new Error(res.data.message || 'Failed to create payment session.')
      }

      /*
       * Step 2: Redirect the browser directly to Stripe's hosted page.
       * redirectToCheckout() was removed in Stripe.js 2025-09-30.
       * The correct modern approach is a plain window.location redirect.
       * No Stripe.js SDK needed for this flow at all.
       */
      const { error } = redirectToStripeCheckout(res.data.url)
      if (error) throw new Error(error.message)

      /* Browser navigates away — code below this line does not run */
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Payment failed. Please try again.'
      setActionError(msg)
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <LoadingSpinner size="lg" text="Loading course…" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 pt-16 px-4">
      <span className="text-6xl">😕</span>
      <h2 className="font-display font-bold text-white"
          style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}>
        Course Not Found
      </h2>
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

      {/* ── Hero Band ─────────────────────────── */}
      <div className="relative border-b border-white/6 overflow-hidden">
        {course.thumbnail && (
          <div className="absolute inset-0">
            <img src={course.thumbnail} alt="" aria-hidden
                 className="w-full h-full object-cover scale-110 blur-2xl opacity-12" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-900/95 via-ink-900/90 to-ink-950" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">

            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-4 animate-fade-up">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 font-body"
                   style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', color: 'var(--text-dim)' }}>
                <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-muted)' }}>{course.category}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <CategoryBadge category={course.category} />
                <LevelBadge    level={course.level} />
                {course.enrollmentStatus === 'open'
                  ? <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">✓ Open</span>
                  : <span className="badge bg-white/5 text-white/40 border border-white/10">Coming Soon</span>}
              </div>

              {/* Title */}
              <h1 className="font-display font-extrabold text-white leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                {course.title}
              </h1>

              {/* Description */}
              <p className="font-body leading-relaxed max-w-2xl"
                 style={{ fontSize: 'clamp(0.9rem, 2vw, 1.0625rem)', color: 'var(--text-muted)' }}>
                {course.description?.split('\n')[0]}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 md:gap-5 font-body"
                   style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400">★</span>
                  <span className="text-white font-display font-semibold">{course.rating?.toFixed(1)}</span>
                  <span>({compactNum(course.totalReviews || 0)} reviews)</span>
                </span>
                <span>👥 {compactNum(course.enrolledStudents?.length || 0)}</span>
                <span>⏱ {formatDuration(course.duration)}</span>
                <span className="hidden sm:inline">📅 {formatDate(course.createdAt)}</span>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-2 font-body"
                   style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
                <div className="rounded-lg bg-gradient-to-br from-violet-500 to-violet-800
                                flex items-center justify-center font-display font-bold text-white flex-shrink-0"
                     style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.625rem' }}>
                  {instructorName[0]?.toUpperCase()}
                </div>
                <span>Created by</span>
                <span className="text-violet-300 font-medium">{instructorName}</span>
              </div>

              {/* Progress if enrolled */}
              {enrolled && progress && (
                <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold text-emerald-400"
                       style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                      Your Progress
                    </p>
                    <span className="font-display font-bold text-emerald-400"
                          style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                      {progress.progress}%
                    </span>
                  </div>
                  <ProgressBar value={progress.progress} showLabel={false} size="md" glow />
                  <p className="font-body"
                     style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', color: 'var(--text-dim)' }}>
                    {progress.completedLessons?.length || 0} of {totalLessons} lessons completed
                  </p>
                </div>
              )}
            </div>

            {/* Right: Enroll Card */}
            <div className="card p-5 md:p-6 rounded-3xl space-y-4 md:space-y-5
                            lg:sticky lg:top-24 animate-fade-up opacity-0"
                 style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>

              {/* Thumbnail */}
              <div className="rounded-2xl overflow-hidden bg-ink-900"
                   style={{ aspectRatio: '16/9' }}>
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-ink-900
                                    flex items-center justify-center"
                         style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}>
                      {categoryIcon(course.category)}
                    </div>
                }
              </div>

              {/* Price */}
              <div>
                <p className="font-display font-extrabold text-white"
                   style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)' }}>
                  {formatPrice(course.price)}
                </p>
                {course.price > 0 && (
                  <p className="font-body line-through mt-0.5"
                     style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-dim)' }}>
                    {formatPrice(course.price * 2)}
                  </p>
                )}
              </div>

              {/* Progress bar if enrolled */}
              {enrolled && progress && (
                <ProgressBar value={progress.progress} size="sm" />
              )}

              {/* Error */}
              {actionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 font-body"
                     style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                  ⚠️ {actionError}
                </div>
              )}

              {/* CTA */}
              {enrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl
                                  bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-body"
                       style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>
                    ✅ You're enrolled in this course
                  </div>
                  <button
                    onClick={() => navigate(`/learn/${id}`)}
                    className="btn btn-primary btn-lg w-full justify-center"
                  >
                    {progress?.progress === 100 ? '📜 Review Course' : '▶ Continue Learning'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={course.price === 0 ? handleEnrollFree : handlePaid}
                  disabled={actionLoading || course.enrollmentStatus !== 'open'}
                  className={`w-full justify-center rounded-xl font-display font-bold
                    transition-all duration-200
                    ${course.enrollmentStatus !== 'open'
                      ? 'bg-ink-700 text-white/30 cursor-not-allowed border border-white/8 p-4'
                      : 'btn btn-primary btn-lg'}`}
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                       rounded-full animate-spin flex-shrink-0" />
                      <span>
                        {course.price > 0 ? 'Redirecting to Stripe…' : 'Enrolling…'}
                      </span>
                    </span>
                  ) : course.enrollmentStatus !== 'open'
                    ? '🔒 Coming Soon'
                    : course.price > 0
                      ? `💳 Enroll — ${formatPrice(course.price)}`
                      : '🚀 Enroll Free'}
                </button>
              )}

              {/* Stripe trust badge — only for paid courses */}
              {course.price > 0 && !enrolled && (
                <div className="flex items-center justify-center gap-1.5 font-body"
                     style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--text-dim)' }}>
                  🔒 Secured by
                  <span className="text-white/50 font-semibold">Stripe</span>
                  · 30-day money-back guarantee
                </div>
              )}

              {/* Perks list */}
              <ul className="space-y-2 pt-1 border-t border-white/6">
                {[
                  `📚 ${totalLessons} lessons · ${formatDuration(course.duration)}`,
                  '♾️ Full lifetime access',
                  '📱 Works on any device',
                  '🏆 Certificate on completion',
                ].map(item => (
                  <li key={item}
                      className="font-body flex items-start gap-2"
                      style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: 'var(--text-muted)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-8 md:space-y-10">

            {/* Video preview */}
            {course.videoUrl && !enrolled && (
              <section className="animate-fade-up">
                <h2 className="font-display font-bold text-white mb-4 md:mb-5"
                    style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                  Free Preview
                </h2>
                <div className="relative rounded-2xl overflow-hidden bg-black"
                     style={{ aspectRatio: '16/9' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${course.videoUrl}`}
                    title="Free Preview"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-ink-800 rounded-xl w-fit flex-wrap">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-display font-medium
                    capitalize transition-all duration-200
                    ${tab === t
                      ? 'bg-violet-600 text-white shadow-violet-sm'
                      : 'text-white/40 hover:text-white'}`}
                  style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab: Curriculum */}
            {tab === 'curriculum' && (
              <section className="space-y-3 animate-scale-in">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h2 className="font-display font-bold text-white"
                      style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                    Curriculum
                  </h2>
                  <span className="font-body"
                        style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: 'var(--text-muted)' }}>
                    {totalLessons} lessons · {formatDuration(course.duration)}
                  </span>
                </div>

                {course.curriculum?.map((sec, i) => (
                  <div key={i} className="card rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setActiveSection(activeSection === i ? -1 : i)}
                      className="w-full flex justify-between items-center p-4 md:p-5
                                 text-left hover:bg-white/3 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="rounded-lg bg-violet-500/15 border border-violet-500/25
                                        flex items-center justify-center text-violet-400
                                        font-display font-bold flex-shrink-0"
                             style={{ width: '2rem', height: '2rem', fontSize: 'clamp(0.7rem, 2vw, 0.875rem)' }}>
                          {i + 1}
                        </div>
                        <span className="font-display font-semibold text-white truncate"
                              style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
                          {sec.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-body hidden sm:inline"
                              style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', color: 'var(--text-dim)' }}>
                          {sec.lessons?.length} lessons
                        </span>
                        <span className={`text-white/30 transition-transform duration-200 text-xs
                          ${activeSection === i ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>

                    {activeSection === i && (
                      <div className="border-t border-white/6 divide-y divide-white/4">
                        {sec.lessons?.map((lesson, j) => {
                          const l = typeof lesson === 'object'
                            ? lesson
                            : { title: lesson, id: `${i}-${j}` }
                          return (
                            <div key={j}
                                 className="flex items-center justify-between px-4 md:px-5 py-3">
                              <div className="flex items-center gap-3 font-body min-w-0"
                                   style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
                                <span className="text-violet-500 flex-shrink-0">▶</span>
                                <span className="truncate">{l.title}</span>
                              </div>
                              {l.duration && (
                                <span className="font-body flex-shrink-0 ml-2"
                                      style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', color: 'var(--text-dim)' }}>
                                  {l.duration}m
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {!enrolled && (
                  <div className="mt-6 p-5 md:p-6 rounded-2xl border border-violet-500/20
                                  bg-violet-500/5 text-center">
                    <p className="font-display font-semibold text-white mb-2"
                       style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
                      Ready to start?
                    </p>
                    <p className="font-body mb-4"
                       style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
                      Enroll now for full access to all {totalLessons} lessons.
                    </p>
                    <button
                      onClick={course.price === 0 ? handleEnrollFree : handlePaid}
                      disabled={actionLoading}
                      className="btn btn-primary"
                    >
                      {course.price > 0
                        ? `Enroll for ${formatPrice(course.price)}`
                        : '🚀 Enroll Free'}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Tab: Outcomes */}
            {tab === 'outcomes' && (
              <section className="animate-scale-in">
                <h2 className="font-display font-bold text-white mb-5"
                    style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                  What You'll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(course.outcomes || []).map((o, i) => (
                    <div key={i}
                         className="card flex gap-3 p-4 rounded-xl
                                    hover:-translate-y-0.5 transition-transform">
                      <span className="text-violet-400 flex-shrink-0 mt-0.5 font-bold">✓</span>
                      <span className="font-body leading-relaxed"
                            style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
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
                <h2 className="font-display font-bold text-white mb-5"
                    style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)' }}>
                  Your Instructor
                </h2>
                <div className="card p-5 md:p-6 rounded-2xl flex gap-4 md:gap-5 items-start">
                  <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800
                                  flex items-center justify-center font-display font-black
                                  text-white flex-shrink-0"
                       style={{
                         width: 'clamp(3rem, 6vw, 4rem)',
                         height: 'clamp(3rem, 6vw, 4rem)',
                         fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                       }}>
                    {instructorName[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-white mb-1"
                        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                      {instructorName}
                    </h3>
                    <p className="font-body leading-relaxed"
                       style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: 'var(--text-muted)' }}>
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