import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CourseCard    from '../components/courses/CourseCard'
import CourseCardSkeleton from '../components/courses/CourseCardSkeleton'
import { MOCK_COURSES, CATEGORIES, STATS } from '../data/mockData'
import api           from '../services/api'

const FEATURED_IDS = ['c1', 'c2', 'c3', 'c5', 'c9', 'c4']

const TESTIMONIALS = [
  {
    name:   'Amara O.',
    role:   'Frontend Developer',
    avatar: 'A',
    text:   'LearnPro helped me transition from accounting to tech in just 6 months. The React bootcamp was phenomenal.',
    stars:  5,
  },
  {
    name:   'James K.',
    role:   'Data Analyst',
    avatar: 'J',
    text:   "The AI study assistant is a game changer. It's like having a tutor available 24/7 who actually knows the material.",
    stars:  5,
  },
  {
    name:   'Mei L.',
    role:   'ML Engineer',
    avatar: 'M',
    text:   'Best platform for structured learning. The curriculum design makes complex topics genuinely approachable.',
    stars:  5,
  },
]

export default function Home() {
  const [query,        setQuery]        = useState('')
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [coursesLoading,  setCoursesLoading]  = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      setCoursesLoading(true)
      try {
        const res = await api.get('/courses?limit=6')
        const data = res.data.courses || res.data
        setFeaturedCourses(data.slice(0, 6))
      } catch {
        setFeaturedCourses(
          MOCK_COURSES.filter(c => FEATURED_IDS.includes(c._id))
        )
      } finally {
        setCoursesLoading(false)
      }
    }
    load()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/courses?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center
                           px-4 pt-24 pb-20">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large glow orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[600px] rounded-full
                          bg-violet-600/10 blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4
                          w-[400px] h-[400px] rounded-full
                          bg-amber-500/8 blur-[100px] animate-pulse-soft"
               style={{ animationDelay: '2s' }} />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025]"
               style={{
                 backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                 backgroundSize: '60px 60px',
               }} />

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-400/50 animate-float"
              style={{
                top:            `${20 + (i * 10) % 70}%`,
                left:           `${10 + (i * 13) % 80}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${4 + i}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 pill mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-sm font-display font-medium">
              AI-Powered Learning Platform · 500+ Expert Courses
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold leading-[1.05] mb-6
                         text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                         animate-fade-up opacity-0"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <span className="text-white">Learn Smarter,</span>
            <br />
            <span className="text-gradient-full">Grow Faster.</span>
          </h1>

          {/* Subheadline */}
          <p className="section-subtitle max-w-2xl mx-auto mb-10 text-lg md:text-xl
                        animate-fade-up opacity-0"
             style={{ animationDelay: '0.22s', animationFillMode: 'both' }}>
            Access world-class courses, track your progress in real time, and get
            personalized guidance from our AI learning assistant — all in one place.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-12
                       animate-fade-up opacity-0"
            style={{ animationDelay: '0.34s', animationFillMode: 'both' }}
          >
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search courses, skills, topics…"
                className="input pl-11 h-14 text-base w-full rounded-2xl"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg whitespace-nowrap rounded-2xl h-14">
              Search Courses
            </button>
          </form>

          {/* CTA pair */}
          <div className="flex flex-wrap gap-4 justify-center
                          animate-fade-up opacity-0"
               style={{ animationDelay: '0.44s', animationFillMode: 'both' }}>
            <Link to="/courses"  className="btn btn-primary  btn-lg">
              Explore All Courses
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Start for Free
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-6
                          animate-fade-up opacity-0"
               style={{ animationDelay: '0.54s', animationFillMode: 'both' }}>
            <div className="flex -space-x-2">
              {['S', 'J', 'A', 'M', 'K'].map((l, i) => (
                <div key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700
                             border-2 border-ink-950 flex items-center justify-center
                             text-xs font-display font-bold text-white">
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">{'★★★★★'}</div>
              <span className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                Trusted by <span className="text-white font-display font-semibold">50,000+</span> learners
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section className="border-y border-white/6 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={s.label} className="text-center stagger-children">
                <div className="text-3xl mb-2 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                  {s.icon}
                </div>
                <p className="font-display font-extrabold text-4xl text-gradient-violet mb-1">
                  {s.value}
                </p>
                <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">Browse by Domain</p>
            <h2 className="section-title mb-4">Find Your Path</h2>
            <p className="section-subtitle mx-auto max-w-xl">
              From web development to AI — discover the domain that matches your ambitions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 stagger-children">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className={`
                  group card overflow-hidden
                  bg-gradient-to-b ${cat.color} border
                  p-6 flex flex-col items-center text-center
                  hover:scale-[1.03] hover:-translate-y-1
                  transition-all duration-300 ease-spring
                  cursor-pointer
                `}
              >
                <span className="text-4xl mb-3 group-hover:scale-110
                                 transition-transform duration-300">
                  {cat.icon}
                </span>
                <h3 className="font-display font-bold text-white text-sm leading-tight mb-1">
                  {cat.name}
                </h3>
                <p className="font-body text-2xs" style={{ color: 'var(--text-muted)' }}>
                  {cat.count} courses
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ─────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="section-eyebrow mb-3">Curated for You</p>
              <h2 className="section-title">Featured Courses</h2>
            </div>
            <Link to="/courses" className="btn btn-outline flex-shrink-0">
              View All Courses
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {coursesLoading
              ? Array(6).fill(null).map((_, i) => <CourseCardSkeleton key={i} />)
              : featuredCourses.map((course, i) => (
                  <CourseCard key={course._id} course={course} index={i} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-3">Simple Process</p>
            <h2 className="section-title">How LearnPro Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {[
              {
                step:  '01',
                icon:  '🎯',
                title: 'Choose Your Goal',
                desc:  'Browse 500+ courses across 8 domains. Use LearnBot to get a personalized recommendation based on your goals.',
              },
              {
                step:  '02',
                icon:  '📖',
                title: 'Learn at Your Pace',
                desc:  'Access video lectures, exercises, and projects anytime. Track your progress with detailed analytics.',
              },
              {
                step:  '03',
                icon:  '🏆',
                title: 'Earn & Apply',
                desc:  'Complete courses, earn certificates, and build a portfolio that gets you hired.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                {/* Step number watermark */}
                <div className="absolute top-4 right-5 font-display font-black text-6xl
                                text-white/[0.04] select-none group-hover:text-white/[0.06]
                                transition-colors">
                  {step}
                </div>
                <div className="text-4xl mb-5">{icon}</div>
                <h3 className="font-display font-bold text-white text-xl mb-3">{title}</h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">Student Stories</p>
            <h2 className="section-title">What Learners Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 stagger-children">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card p-6 space-y-4 hover:-translate-y-1 transition-all duration-300">
                <div className="flex text-amber-400 text-sm">
                  {'★'.repeat(t.stars)}
                </div>
                <p className="font-body text-sm leading-relaxed italic"
                   style={{ color: 'var(--text-muted)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-800
                                  flex items-center justify-center font-display font-bold text-white text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-white text-sm">{t.name}</p>
                    <p className="font-body text-2xs" style={{ color: 'var(--text-dim)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="
            relative rounded-3xl overflow-hidden noise
            p-12 md:p-20 text-center
            bg-gradient-to-br from-violet-800 via-violet-700 to-violet-900
          ">
            {/* Decorative orbs inside banner */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full
                            bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full
                            bg-violet-400/20 blur-3xl pointer-events-none" />

            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                 style={{
                   backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                   backgroundSize: '28px 28px',
                 }} />

            <div className="relative z-10">
              <p className="font-display font-semibold text-violet-200/70 text-sm
                            tracking-[0.2em] uppercase mb-4">
                Start Today · No Credit Card Required
              </p>
              <h2 className="font-display font-extrabold text-white leading-tight mb-5
                             text-4xl md:text-6xl">
                Ready to Level Up?
              </h2>
              <p className="font-body text-violet-200/70 text-lg max-w-xl mx-auto mb-10">
                Join 50,000+ learners already building the future. Free plan available forever.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register" className="btn btn-amber btn-lg">
                  Create Free Account
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link to="/courses" className="btn btn-ghost btn-lg border border-white/20 hover:border-white/40">
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}