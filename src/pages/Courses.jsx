import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams, Link }  from 'react-router-dom'
import CourseCard                 from '../components/courses/CourseCard'
import CourseCardSkeleton         from '../components/courses/CourseCardSkeleton'
import EmptyState                 from '../components/ui/EmptyState'
import { useDebounce }            from '../hooks/useDebounce'
import api                        from '../services/api'
import { MOCK_COURSES, CATEGORIES } from '../data/mockData'

const LEVELS    = ['All', 'Beginner', 'Intermediate', 'Advanced']
const PRICES    = ['All', 'Free', 'Paid']
const SORTS     = [
  { value:'newest',     label:'Newest'       },
  { value:'popular',    label:'Most Popular' },
  { value:'rating',     label:'Top Rated'    },
  { value:'price-low',  label:'Price ↑'      },
  { value:'price-high', label:'Price ↓'      },
]
const ALL_CATS  = ['All', ...CATEGORIES.map(c => c.name)]
const PAGE_SIZE = 9

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [allCourses, setAllCourses] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [apiError,   setApiError]   = useState(false)

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchInput, 350)

  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [level,    setLevel]    = useState('All')
  const [price,    setPrice]    = useState('All')
  const [sort,     setSort]     = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setApiError(false)
      try {
        const res = await api.get('/courses?limit=100')
        setAllCourses(res.data.courses || res.data)
      } catch {
        setApiError(true)
        setAllCourses(MOCK_COURSES)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => { setCurrentPage(1) }, [debouncedSearch, category, level, price, sort])

  useEffect(() => {
    const params = {}
    if (debouncedSearch)    params.search   = debouncedSearch
    if (category !== 'All') params.category = category
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, category])

  const filtered = useMemo(() => {
    let list = [...allCourses]

    /*
     * SEARCH — title only.
     *
     * The search matches ONLY the course title.
     * We do NOT search description, instructor, or category
     * so that typing "web" shows only courses whose
     * title contains "web", not every course that
     * mentions the word somewhere in its content.
     *
     * Sort order:
     *   1. Title STARTS WITH the query  (highest priority)
     *   2. Title CONTAINS the query     (second priority)
     *
     * This means searching "web" shows
     * "Web Development Bootcamp" before "Advanced Web APIs".
     */
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()

      const startsWith = []
      const contains   = []

      list.forEach(course => {
        const title = course.title.toLowerCase()
        if (title.startsWith(q)) {
          startsWith.push(course)
        } else if (title.includes(q)) {
          contains.push(course)
        }
        /* anything that doesn't match title is excluded */
      })

      list = [...startsWith, ...contains]
    }

    /* Category filter */
    if (category !== 'All') list = list.filter(c => c.category === category)

    /* Level filter */
    if (level !== 'All') list = list.filter(c => c.level === level)

    /* Price filter */
    if (price === 'Free') list = list.filter(c => c.price === 0)
    if (price === 'Paid') list = list.filter(c => c.price > 0)

    /* Sort — only applied when not searching
     * (when searching, starts-with order is more useful) */
    if (!debouncedSearch.trim()) {
      switch (sort) {
        case 'popular':
          list.sort((a,b) => (b.enrolledStudents?.length||0) - (a.enrolledStudents?.length||0))
          break
        case 'rating':
          list.sort((a,b) => (b.rating||0) - (a.rating||0))
          break
        case 'price-low':
          list.sort((a,b) => (a.price||0) - (b.price||0))
          break
        case 'price-high':
          list.sort((a,b) => (b.price||0) - (a.price||0))
          break
        default:
          break
      }
    }

    return list
  }, [allCourses, debouncedSearch, category, level, price, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const clearAll = useCallback(() => {
    setSearchInput('')
    setCategory('All')
    setLevel('All')
    setPrice('All')
    setSort('newest')
    setSearchParams({}, { replace: true })
  }, [])

  const hasActiveFilters =
    debouncedSearch || category !== 'All' || level !== 'All' || price !== 'All'

  const topRef   = useRef(null)
  const goToPage = (p) => {
    setCurrentPage(p)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const pageNumbers = useMemo(() => {
    const pages  = []
    const win    = 2
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - win && p <= currentPage + win)) {
        pages.push(p)
      } else if (p === currentPage - win - 1 || p === currentPage + win + 1) {
        pages.push('…')
      }
    }
    return pages.filter((p, i) => !(p === '…' && pages[i-1] === '…'))
  }, [totalPages, currentPage])

  return (
    <main className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-7xl mx-auto" ref={topRef}>

        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <p className="section-eyebrow mb-2">Explore</p>
          <h1 className="section-title mb-2">All Courses</h1>
          <p className="section-subtitle">
            {loading ? 'Loading…' : (
              <>
                {filtered.length} course{filtered.length !== 1 ? 's' : ''}
                {allCourses.length !== filtered.length && ` of ${allCourses.length}`}
              </>
            )}
          </p>
          {apiError && (
            <p className="font-body mt-1"
               style={{ fontSize:'clamp(0.7rem,1.5vw,0.8rem)', color:'rgba(251,191,36,0.7)' }}>
              ⚡ Showing demo data — backend not connected
            </p>
          )}
        </div>

        {/* Search */}
        <div className="mb-8 animate-fade-up opacity-0"
             style={{ animationDelay:'0.1s', animationFillMode:'both' }}>
          <div className="relative max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by course title…"
              className="input pl-10"
              style={{ paddingRight: searchInput ? '2.5rem' : undefined }}
            />
            {searchInput && searchInput !== debouncedSearch && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="block w-4 h-4 border-2 border-violet-500/50 border-t-violet-400
                                 rounded-full animate-spin" />
              </span>
            )}
            {searchInput && searchInput === debouncedSearch && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30
                           hover:text-white transition-colors"
                style={{ fontSize:'0.875rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {debouncedSearch && (
            <p className="mt-2 font-body"
               style={{ fontSize:'clamp(0.7rem,1.5vw,0.8rem)', color:'var(--text-dim)' }}>
              Showing titles matching "
              <span className="text-violet-300">{debouncedSearch}</span>"
            </p>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6
                        animate-fade-up opacity-0"
             style={{ animationDelay:'0.15s', animationFillMode:'both' }}>
          {ALL_CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                flex-shrink-0 font-display font-medium transition-all duration-200
                whitespace-nowrap rounded-xl border
                ${category === cat
                  ? 'bg-violet-600 text-white shadow-violet-sm border-violet-600'
                  : 'bg-ink-800 text-white/50 hover:text-white border-white/8 hover:border-white/15'}
              `}
              style={{ padding:'0.5em 1em', fontSize:'clamp(0.8rem,2vw,0.9rem)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Level + Price + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8
                        animate-fade-up opacity-0"
             style={{ animationDelay:'0.2s', animationFillMode:'both' }}>
          <div className="flex flex-wrap gap-3">

            {/* Level */}
            <div className="flex gap-1.5">
              {LEVELS.map(lv => (
                <button
                  key={lv}
                  onClick={() => setLevel(lv)}
                  className={`
                    font-display font-medium rounded-lg border transition-all duration-200
                    ${level === lv
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                      : 'text-white/40 hover:text-white border-transparent hover:border-white/10'}
                  `}
                  style={{ padding:'0.4em 0.75em', fontSize:'clamp(0.75rem,2vw,0.85rem)' }}
                >
                  {lv}
                </button>
              ))}
            </div>

            {/* Price */}
            <div className="flex gap-1.5">
              {PRICES.map(p => (
                <button
                  key={p}
                  onClick={() => setPrice(p)}
                  className={`
                    font-display font-medium rounded-lg border transition-all duration-200
                    ${price === p
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'text-white/40 hover:text-white border-transparent hover:border-white/10'}
                  `}
                  style={{ padding:'0.4em 0.75em', fontSize:'clamp(0.75rem,2vw,0.85rem)' }}
                >
                  {p}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="font-display font-medium rounded-lg text-rose-400
                           hover:text-rose-300 border border-rose-500/20
                           hover:border-rose-500/40 transition-all"
                style={{ padding:'0.4em 0.75em', fontSize:'clamp(0.75rem,2vw,0.85rem)' }}
              >
                ✕ Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="font-body"
                  style={{ fontSize:'clamp(0.75rem,2vw,0.85rem)', color:'var(--text-dim)' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input cursor-pointer"
              style={{ padding:'0.4em 0.75em', fontSize:'clamp(0.75rem,2vw,0.85rem)', width:'auto' }}
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(9).fill(null).map((_,i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No courses found"
            subtitle={
              debouncedSearch
                ? `No course titles match "${debouncedSearch}". Try a different term.`
                : 'Try adjusting your filters.'
            }
            action={
              <button onClick={clearAll} className="btn btn-primary">
                Clear All Filters
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginated.map((course, i) => (
                <CourseCard key={course._id} course={course} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 space-y-4">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-ghost btn-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === '…' ? (
                      <span key={`e${i}`} className="font-body px-1"
                            style={{ fontSize:'clamp(0.8rem,2vw,0.9rem)', color:'var(--text-dim)' }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`
                          font-display font-semibold rounded-xl transition-all duration-200
                          ${p === currentPage
                            ? 'bg-violet-600 text-white shadow-violet-sm'
                            : 'text-white/50 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10'}
                        `}
                        style={{ width:'2.25rem', height:'2.25rem', fontSize:'clamp(0.8rem,2vw,0.9rem)' }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-ghost btn-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>

                <p className="text-center font-body"
                   style={{ fontSize:'clamp(0.7rem,1.5vw,0.8rem)', color:'var(--text-dim)' }}>
                  Page {currentPage} of {totalPages} · {((currentPage-1)*PAGE_SIZE)+1}–{Math.min(currentPage*PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}