import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link }              from 'react-router-dom'
import { useProgress }   from '../hooks/useProgress'
import ProgressBar       from '../components/ui/ProgressBar'
import LoadingSpinner    from '../components/ui/LoadingSpinner'
import { MOCK_COURSES }  from '../data/mockData'
import { formatDuration } from '../utils/helpers'
import api               from '../services/api'

export default function CoursePlayer() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { isEnrolled, enroll, completeLesson, getCourseProgress, isLessonCompleted } = useProgress()

  const [course,          setCourse]          = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)
  const [sidebarOpen,     setSidebarOpen]     = useState(true)
  const [justCompleted,   setJustCompleted]   = useState(false)
  const [celebrating,     setCelebrating]     = useState(false)
  const timerRef = useRef(null)

  /* Load course */
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

  /* Flatten all lessons */
  const allLessons = course?.curriculum?.flatMap(
    (sec, si) => sec.lessons.map((lesson, li) => ({
      ...lesson,
      sectionTitle: sec.section,
      sectionIdx:   si,
      globalIdx:    course.curriculum
        .slice(0, si)
        .reduce((sum, s) => sum + s.lessons.length, 0) + li,
    }))
  ) || []

  const totalLessons = allLessons.length
  const activeLesson = allLessons[activeLessonIdx]
  const progress     = getCourseProgress(id)

  /* Auto-enroll if not enrolled */
  useEffect(() => {
    if (course && !isEnrolled(id)) {
      enroll(id, totalLessons)
    }
  }, [course, id, totalLessons])

  /* Mark lesson complete */
  const markComplete = useCallback(() => {
    if (!activeLesson || !course) return

    const newProgress = completeLesson(id, activeLesson.id, totalLessons)
    setJustCompleted(true)

    if (newProgress === 100) {
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 4000)
    }

    setTimeout(() => setJustCompleted(false), 2500)
  }, [activeLesson, course, id, totalLessons, completeLesson])

  /* Go to next lesson */
  const goNext = useCallback(() => {
    if (activeLessonIdx < allLessons.length - 1) {
      markComplete()
      setTimeout(() => {
        setActiveLessonIdx(p => p + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 300)
    } else {
      markComplete()
    }
  }, [activeLessonIdx, allLessons.length, markComplete])

  const goPrev = useCallback(() => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(p => p - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeLessonIdx])

  /* Switch lesson and mark previous complete */
  const switchLesson = (idx) => {
    setActiveLessonIdx(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading course player…" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
      <span className="text-5xl">😕</span>
      <p className="font-display font-bold text-white text-xl">Course not found</p>
      <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
    </div>
  )

  const lessonCompleted    = activeLesson ? isLessonCompleted(id, activeLesson.id) : false
  const progressData       = getCourseProgress(id)
  const progressPct        = progressData?.progress || 0
  const completedCount     = progressData?.completedLessons?.length || 0
  const isLastLesson       = activeLessonIdx === allLessons.length - 1

  /* Group lessons by section for sidebar */
  const sections = course.curriculum?.map((sec, si) => ({
    ...sec,
    startIdx: course.curriculum.slice(0, si).reduce((s, x) => s + x.lessons.length, 0),
  })) || []

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">

      {/* ── Top Bar ─────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-ink-900/95 backdrop-blur-xl
                         border-b border-white/6 flex items-center px-4 gap-4 z-40
                         sticky top-0">
        <Link to={`/courses/${id}`}
          className="flex items-center gap-2 text-white/50 hover:text-white
                     transition-colors flex-shrink-0">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="text-sm font-body hidden sm:block">Back</span>
        </Link>

        <div className="w-px h-6 bg-white/10 flex-shrink-0" />

        {/* Course title */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-white text-sm truncate">
            {course.title}
          </p>
          {activeLesson && (
            <p className="font-body text-2xs truncate" style={{ color: 'var(--text-dim)' }}>
              {activeLesson.sectionTitle} · {activeLesson.title}
            </p>
          )}
        </div>

        {/* Progress chip */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="w-32">
            <ProgressBar value={progressPct} showLabel={false} size="sm" />
          </div>
          <span className={`font-display font-bold text-sm
            ${progressPct === 100 ? 'text-emerald-400' : 'text-violet-300'}`}>
            {progressPct}%
          </span>
        </div>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="flex-shrink-0 p-2 rounded-lg text-white/40 hover:text-white
                     hover:bg-white/6 transition-all"
          title={sidebarOpen ? 'Hide curriculum' : 'Show curriculum'}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </header>

      {/* ── Main Layout ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Video + Controls ──────────────────── */}
        <div className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${sidebarOpen ? '' : 'w-full'}
        `}>

          {/* Video area */}
          <div className="relative bg-black flex-shrink-0">
            {activeLesson?.videoId ? (
              <div className="aspect-video w-full">
                <iframe
                  key={activeLesson.id}
                  src={`https://www.youtube.com/embed/${activeLesson.videoId}?autoplay=0&rel=0&modestbranding=1`}
                  title={activeLesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              /* Placeholder when no video ID */
              <div className="aspect-video w-full bg-gradient-to-br
                              from-ink-800 to-ink-900
                              flex flex-col items-center justify-center gap-4
                              relative overflow-hidden">
                <div className="absolute inset-0 line-grid opacity-50" />
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-violet-600/20
                                  border border-violet-500/30
                                  flex items-center justify-center text-4xl mx-auto mb-4
                                  animate-pulse-soft">
                    🎬
                  </div>
                  <p className="font-display font-bold text-white text-xl mb-2">
                    {activeLesson?.title}
                  </p>
                  <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                    {activeLesson?.duration}min lesson · Click "Mark Complete" when done
                  </p>
                </div>
              </div>
            )}

            {/* Celebration overlay */}
            {celebrating && (
              <div className="absolute inset-0 pointer-events-none z-20
                              flex items-center justify-center">
                <div className="text-center animate-scale-in">
                  <div className="text-7xl mb-3">🎉</div>
                  <p className="font-display font-extrabold text-3xl text-white
                                 text-gradient-full">
                    Course Complete!
                  </p>
                  <p className="font-body text-white/70 mt-2">
                    Amazing work, you finished the entire course!
                  </p>
                </div>
                {/* Confetti dots */}
                {[...Array(20)].map((_, i) => (
                  <div key={i}
                    className="absolute w-2 h-2 rounded-full animate-float"
                    style={{
                      background:       ['#8b5cf6','#f59e0b','#10b981','#fb7185','#22d3ee'][i % 5],
                      top:              `${Math.random() * 100}%`,
                      left:             `${Math.random() * 100}%`,
                      animationDelay:   `${Math.random() * 2}s`,
                      animationDuration:`${2 + Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Just completed flash */}
            {justCompleted && !celebrating && (
              <div className="absolute top-4 right-4 z-10 animate-fade-in">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                bg-emerald-500/20 border border-emerald-500/40
                                backdrop-blur-sm shadow-emerald-sm">
                  <span className="text-emerald-400 text-base">✅</span>
                  <span className="font-display font-semibold text-emerald-300 text-sm">
                    Lesson marked complete!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Lesson Info & Controls ─────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

              {/* Lesson header */}
              <div className="flex flex-col sm:flex-row sm:items-start
                              justify-between gap-4">
                <div>
                  <p className="section-eyebrow mb-1">{activeLesson?.sectionTitle}</p>
                  <h1 className="font-display font-bold text-2xl text-white leading-tight">
                    {activeLesson?.title}
                  </h1>
                  {activeLesson?.duration && (
                    <p className="font-body text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      ⏱ {activeLesson.duration} min
                      {lessonCompleted && (
                        <span className="ml-3 text-emerald-400 font-display font-semibold">
                          ✓ Completed
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Mark complete button */}
                {!lessonCompleted ? (
                  <button
                    onClick={markComplete}
                    className="btn btn-emerald flex-shrink-0"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    Mark as Complete
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                                  bg-emerald-500/10 border border-emerald-500/25 flex-shrink-0">
                    <span className="text-emerald-400">✅</span>
                    <span className="font-display font-semibold text-emerald-400 text-sm">
                      Completed
                    </span>
                  </div>
                )}
              </div>

              {/* Progress summary */}
              <div className="card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-white text-sm">
                    Course Progress
                  </p>
                  <p className={`font-display font-bold text-sm
                    ${progressPct === 100 ? 'text-emerald-400' : 'text-violet-300'}`}>
                    {completedCount} / {totalLessons} lessons
                  </p>
                </div>
                <ProgressBar value={progressPct} showLabel={false} size="md" glow />
                {progressPct === 100 && (
                  <p className="text-emerald-400 font-display font-semibold text-sm
                                text-center pt-1">
                    🏆 Course Complete — Congratulations!
                  </p>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={goPrev}
                  disabled={activeLessonIdx === 0}
                  className="btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Previous
                </button>

                <div className="text-xs font-body text-center"
                     style={{ color: 'var(--text-dim)' }}>
                  Lesson {activeLessonIdx + 1} of {allLessons.length}
                </div>

                {isLastLesson ? (
                  <button
                    onClick={markComplete}
                    className="btn btn-amber"
                  >
                    {lessonCompleted ? '🏆 Finished!' : 'Complete Course'}
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="btn btn-primary"
                  >
                    {lessonCompleted ? 'Next Lesson' : 'Complete & Next'}
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* All lessons list (mobile — when sidebar hidden) */}
              {!sidebarOpen && (
                <div className="card rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/6">
                    <h3 className="font-display font-semibold text-white">All Lessons</h3>
                  </div>
                  <div className="divide-y divide-white/4 max-h-80 overflow-y-auto no-scrollbar">
                    {allLessons.map((lesson, idx) => {
                      const done = isLessonCompleted(id, lesson.id)
                      const active = idx === activeLessonIdx
                      return (
                        <button key={lesson.id} onClick={() => switchLesson(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 text-left
                            transition-colors
                            ${active   ? 'bg-violet-500/15 text-white' : 'hover:bg-white/4'}
                            ${done && !active ? 'text-emerald-400/80' : ''}`}>
                          <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center
                                          justify-center text-xs border
                            ${active
                              ? 'bg-violet-600 border-violet-400 text-white'
                              : done
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'border-white/20 text-white/30'}`}>
                            {active ? '▶' : done ? '✓' : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body truncate">{lesson.title}</p>
                            <p className="text-2xs" style={{ color: 'var(--text-dim)' }}>
                              {lesson.sectionTitle}
                            </p>
                          </div>
                          {lesson.duration && (
                            <span className="text-2xs flex-shrink-0"
                                  style={{ color: 'var(--text-dim)' }}>
                              {lesson.duration}m
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar: Curriculum ───────────────── */}
        <aside className={`
          flex-shrink-0 bg-ink-900/80 backdrop-blur-sm
          border-l border-white/6
          overflow-y-auto no-scrollbar
          transition-all duration-300
          ${sidebarOpen ? 'w-80 xl:w-96' : 'w-0 overflow-hidden'}
        `}>
          {sidebarOpen && (
            <div className="p-4">
              {/* Sidebar header */}
              <div className="mb-4 pb-4 border-b border-white/6">
                <h2 className="font-display font-bold text-white text-base mb-3">
                  Course Curriculum
                </h2>
                <ProgressBar value={progressPct} size="sm" />
                <p className="font-body text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
                  {completedCount} of {totalLessons} lessons complete
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                {sections.map((sec, si) => (
                  <div key={si}>
                    <p className="font-display font-semibold text-white/60 text-xs
                                  uppercase tracking-wider mb-2 px-1">
                      {sec.section}
                    </p>
                    <div className="space-y-1">
                      {sec.lessons.map((lesson, li) => {
                        const globalIdx = sec.startIdx + li
                        const lessonObj = typeof lesson === 'object'
                          ? lesson
                          : { id: `${si}-${li}`, title: lesson, duration: null }
                        const done   = isLessonCompleted(id, lessonObj.id)
                        const active = globalIdx === activeLessonIdx

                        return (
                          <button
                            key={lessonObj.id}
                            onClick={() => switchLesson(globalIdx)}
                            className={`
                              lesson-item w-full text-left
                              ${active    ? 'active'    : ''}
                              ${done && !active ? 'completed' : ''}
                            `}
                          >
                            {/* Status icon */}
                            <div className={`
                              w-6 h-6 rounded-full flex-shrink-0 flex items-center
                              justify-center text-xs font-display font-bold border
                              transition-all duration-200
                              ${active
                                ? 'bg-violet-600 border-violet-400 text-white shadow-violet-sm'
                                : done
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                  : 'bg-white/5 border-white/15 text-white/40'}
                            `}>
                              {active ? (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              ) : done ? (
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor" strokeWidth="3">
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              ) : (
                                globalIdx + 1
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-body leading-snug truncate
                                ${active
                                  ? 'text-white font-medium'
                                  : done
                                    ? 'text-emerald-400/80'
                                    : 'text-white/60'}`}>
                                {lessonObj.title}
                              </p>
                              {lessonObj.duration && (
                                <p className="text-2xs mt-0.5"
                                   style={{ color: 'var(--text-dim)' }}>
                                  {lessonObj.duration} min
                                </p>
                              )}
                            </div>

                            {/* Playing indicator */}
                            {active && (
                              <div className="flex gap-0.5 flex-shrink-0">
                                {[0,1,2].map(i => (
                                  <div key={i}
                                    className="w-0.5 bg-violet-400 rounded-full animate-bounce-dot"
                                    style={{
                                      height:           `${8 + (i % 3) * 4}px`,
                                      animationDelay:   `${i * 0.15}s`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}