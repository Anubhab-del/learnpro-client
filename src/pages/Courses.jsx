import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link }         from 'react-router-dom'
import CourseCard         from '../components/courses/CourseCard'
import CourseCardSkeleton from '../components/courses/CourseCardSkeleton'
import EmptyState         from '../components/ui/EmptyState'
import api                from '../services/api'
import { MOCK_COURSES, CATEGORIES } from '../data/mockData'

const LEVELS  = ['All', 'Beginner', 'Intermediate', 'Advanced']
const PRICES  = ['All', 'Free', 'Paid']
const SORTS   = [
  { value: 'newest',     label: 'Newest'         },
  { value: 'popular',    label: 'Most Popular'   },
  { value: 'rating',     label: 'Top Rated'      },
  { value: 'price-low',  label: 'Price ↑'        },
  { value: 'price-high', label: 'Price ↓'        },
]
const ALL_CATEGORIES = ['All', ...CATEGORIES.map(c => c.name)]

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || 'All',
    level:    'All',
    price:    'All',
    sort:     'newest',
  })

  /* Fetch courses */
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get('/courses?limit=50')
        setCourses(res.data.courses || res.data)
      } catch {
        setCourses(MOCK_COURSES)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* Derived filtered list */
  const filtered = useMemo(() => {
    let list = [...courses]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        (typeof c.instructor === 'string'
          ? c.instructor
          : c.instructor?.name || ''
        ).toLowerCase().includes(q)
      )
    }

    if (filters.category !== 'All') list = list.filter(c => c.category === filters.category)
    if (filters.level    !== 'All') list = list.filter(c => c.level    === filters.level)
    if (filters.price === 'Free')   list = list.filter(c => c.price    === 0)
    if (filters.price === 'Paid')   list = list.filter(c => c.price     > 0)

    switch (filters.sort) {
      case 'popular':    list.sort((a,b) => b.enrolledStudents.length - a.enrolledStudents.length); break
      case 'rating':     list.sort((a,b) => b.rating - a.rating);   break
      case 'price-low':  list.sort((a,b) => a.price  - b.price);    break
      case 'price-high': list.sort((a,b) => b.price  - a.price);    break
      default: break
    }

    return list
  }, [courses, filters])

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }))

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchInput.trim()
    setFilter('search', q)
    setSearchParams(q ? { search: q } : {})
  }

  const clearAll = () => {
    setFilters({ search: '', category: 'All', level: 'All', price: 'All', sort: 'newest' })
    setSearchInput('')
    setSearchParams({})
  }

  const hasActiveFilters =
    filters.search || filters.category !== 'All' ||
    filters.level  !== 'All' || filters.price !== 'All'

  return (
    <main className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ──────────────────────── */}
        <div className="mb-10 animate-fade-up">
          <p className="section-eyebrow mb-2">All Courses</p>
          <h1 className="section-title mb-2">Explore Our Catalog</h1>
          <p className="section-subtitle">
            {loading ? 'Loading…' : `${courses.length} courses across ${CATEGORIES.length} domains`}
          </p>
        </div>

        {/* ── Search ───────────────────────────── */}
        <form onSubmit={handleSearch}
              className="flex gap-3 mb-8 animate-fade-up opacity-0"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="relative flex-1 max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, topic, or instructor…"
              className="input pl-10 rounded-xl"
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          {filters.search && (
            <button type="button" onClick={() => { setFilter('search', ''); setSearchInput(''); setSearchParams({}) }}
              className="btn btn-ghost">
              ✕ Clear
            </button>
          )}
        </form>

        {/* ── Category Tabs ────────────────────── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6
                        animate-fade-up opacity-0"
             style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          {ALL_CATEGORIES.map(cat => (
            <button key={cat}
              onClick={() => setFilter('category', cat)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl text-sm font-display font-medium
                transition-all duration-200 whitespace-nowrap
                ${filters.category === cat
                  ? 'bg-violet-600 text-white shadow-violet-sm'
                  : 'bg-ink-800 text-white/50 hover:text-white border border-white/8 hover:border-white/15'}
              `}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Secondary Filters + Sort ─────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8
                        animate-fade-up opacity-0"
             style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <div className="flex flex-wrap gap-3">
            {/* Level */}
            <div className="flex gap-1.5">
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setFilter('level', lv)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-display font-medium
                    transition-all duration-200
                    ${filters.level === lv
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-white/40 hover:text-white border border-transparent hover:border-white/10'}
                  `}>
                  {lv}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="flex gap-1.5">
              {PRICES.map(p => (
                <button key={p} onClick={() => setFilter('price', p)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-display font-medium
                    transition-all duration-200
                    ${filters.price === p
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-white/40 hover:text-white border border-transparent hover:border-white/10'}
                  `}>
                  {p}
                </button>
              ))}
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button onClick={clearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-display font-medium
                           text-rose-400 hover:text-rose-300 border border-rose-500/20
                           hover:border-rose-500/40 transition-all">
                ✕ Reset all
              </button>
            )}
          </div>

          {/* Result count + Sort */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs font-body" style={{ color: 'var(--text-dim)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            <select
              value={filters.sort}
              onChange={e => setFilter('sort', e.target.value)}
              className="input text-xs py-2 w-auto cursor-pointer"
            >
              {SORTS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Results Grid ─────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(9).fill(null).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No courses found"
            subtitle="Try adjusting your search or filters to find what you're looking for."
            action={
              <button onClick={clearAll} className="btn btn-primary">
                Clear All Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}