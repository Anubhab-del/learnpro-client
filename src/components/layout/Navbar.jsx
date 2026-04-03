import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { label: 'Home',      to: '/'          },
  { label: 'Courses',   to: '/courses'   },
  { label: 'Dashboard', to: '/dashboard' },
]

export default function Navbar() {
  const { user, logout }        = useAuth()
  const { pathname }            = useLocation()
  const navigate                = useNavigate()
  const [scrolled, setScrolled]  = useState(false)
  const [menuOpen, setMenuOpen]  = useState(false)
  const [dropOpen, setDropOpen]  = useState(false)
  const [navHeight, setNavHeight] = useState(64)
  const navRef = React.useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  /* Measure actual navbar height so pages can offset correctly */
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight)
    }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  return (
    <header
      ref={navRef}
      className={`
        fixed inset-x-0 top-0 z-50 transition-all duration-500
        ${scrolled
          ? 'bg-ink-950/90 backdrop-blur-xl border-b border-white/6 shadow-2xl shadow-black/30'
          : 'bg-transparent'}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0 min-w-0">
            <div
              className="
                rounded-xl flex items-center justify-center flex-shrink-0
                bg-gradient-to-br from-violet-500 to-violet-700
                shadow-violet-sm group-hover:shadow-violet-md
                group-hover:scale-110 transition-all duration-300
              "
              style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
            >
              <span className="font-display font-black text-white leading-none"
                    style={{ fontSize: '0.875rem' }}>
                L
              </span>
            </div>
            <span
              className="font-display font-extrabold tracking-tight text-gradient-violet whitespace-nowrap"
              style={{ fontSize: 'clamp(0.95rem, 2vw, 1.125rem)' }}
            >
              LearnPro
            </span>
          </Link>

          {/* Desktop Nav — hidden below lg */}
          <ul className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
            {NAV.map(({ label, to }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to))
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`
                      relative font-display font-medium
                      px-3 py-2 rounded-xl
                      transition-all duration-200 whitespace-nowrap
                      ${active
                        ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}
                    `}
                    style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}
                  >
                    {label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2
                                       w-1 h-1 rounded-full bg-violet-400 translate-y-[6px]" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop Auth — hidden below lg */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(p => !p)}
                  className="
                    flex items-center gap-2 px-3 py-1.5 rounded-xl
                    border border-white/8 bg-ink-800/60 backdrop-blur-sm
                    hover:border-violet-500/30 transition-all duration-200
                  "
                >
                  <div
                    className="rounded-lg flex-shrink-0 flex items-center justify-center
                               bg-gradient-to-br from-violet-500 to-violet-700
                               font-display font-bold text-white"
                    style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.75rem' }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span
                    className="font-display font-medium text-white/80 max-w-[5rem] truncate"
                    style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
                  >
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className={`text-white/30 text-xs transition-transform ${dropOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 card rounded-xl overflow-hidden
                                  animate-scale-in origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-white/6">
                      <p className="font-display font-semibold text-white truncate"
                         style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.8125rem)' }}>
                        {user.name}
                      </p>
                      <p className="text-white/40 truncate mt-0.5"
                         style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)' }}>
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70
                                   hover:text-white hover:bg-white/5 transition-colors"
                        style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)' }}
                      >
                        📊 Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                   text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-colors"
                        style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)' }}
                      >
                        ↩ Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost  btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger — shown below lg */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white
                       hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <div className="flex flex-col justify-between"
                 style={{ width: '1.25rem', height: '1rem' }}>
              <span className={`block h-px bg-current transition-all duration-300 origin-left
                ${menuOpen ? 'rotate-45 translate-x-px' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-200
                ${menuOpen ? 'opacity-0 -translate-x-2' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 origin-left
                ${menuOpen ? '-rotate-45 translate-x-px' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <div className={`
          lg:hidden overflow-hidden transition-all duration-300
          ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}
        `}>
          <div className="pt-3 border-t border-white/6 space-y-1">
            {NAV.map(({ label, to }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={`
                    block px-4 py-3 rounded-xl font-display font-medium transition-all
                    ${active
                      ? 'text-violet-300 bg-violet-500/10'
                      : 'text-white/55 hover:text-white hover:bg-white/5'}
                  `}
                  style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                >
                  {label}
                </Link>
              )
            })}

            <div className="pt-2 flex flex-col gap-2 px-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-800 border border-white/8">
                    <div
                      className="rounded-lg bg-gradient-to-br from-violet-500 to-violet-700
                                 flex items-center justify-center font-display font-bold text-white flex-shrink-0"
                      style={{ width: '2rem', height: '2rem', fontSize: '0.875rem' }}
                    >
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-white truncate"
                         style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
                        {user.name}
                      </p>
                      <p className="text-white/40 capitalize"
                         style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)' }}>
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="btn btn-ghost w-full text-rose-400">
                    ↩ Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="btn btn-ghost   w-full">Sign In</Link>
                  <Link to="/register" className="btn btn-primary w-full">Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {dropOpen && <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />}
    </header>
  )
}