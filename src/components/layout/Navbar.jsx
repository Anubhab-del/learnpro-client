import { useState, useEffect } from 'react'
import { Link, useLocation }   from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'

const NAV = [
  { label: 'Home',      to: '/'         },
  { label: 'Courses',   to: '/courses'  },
  { label: 'Dashboard', to: '/dashboard'},
]

export default function Navbar() {
  const { user }               = useAuth()
  const { pathname }           = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50 transition-all duration-500
        ${scrolled
          ? 'bg-ink-950/85 backdrop-blur-xl border-b border-white/6 shadow-2xl shadow-black/30'
          : 'bg-transparent'}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="
              relative w-8 h-8 rounded-xl flex items-center justify-center
              bg-gradient-to-br from-violet-500 to-violet-700
              shadow-violet-sm group-hover:shadow-violet-md
              transition-all duration-300
              group-hover:scale-110
            ">
              <span className="font-display font-black text-sm text-white">L</span>
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-gradient-violet">
              LearnPro
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV.map(({ label, to }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to))
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-display font-medium
                      transition-all duration-200
                      ${active
                        ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20'
                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'}
                    `}
                  >
                    {label}
                    {active && (
                      <span className="
                        absolute bottom-0 left-1/2 -translate-x-1/2
                        w-1 h-1 rounded-full bg-violet-400
                        translate-y-[6px]
                      " />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop Right — always show user since we're always logged in */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl
                            border border-white/8 bg-ink-800/60 backdrop-blur-sm">
              <div className="
                w-7 h-7 rounded-lg flex items-center justify-center
                bg-gradient-to-br from-violet-500 to-violet-700
                font-display font-bold text-xs text-white flex-shrink-0
              ">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-display font-medium text-white/80 max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
            </div>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg text-white/50 hover:text-white
                       hover:bg-white/5 transition-colors"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-px bg-current transition-all duration-300 origin-left
                ${menuOpen ? 'rotate-45 translate-x-px' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-200
                ${menuOpen ? 'opacity-0 -translate-x-2' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 origin-left
                ${menuOpen ? '-rotate-45 translate-x-px' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-300
          ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}
        `}>
          <div className="pt-3 border-t border-white/6 space-y-1">
            {NAV.map(({ label, to }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to}
                  className={`
                    block px-4 py-2.5 rounded-xl text-sm font-display font-medium
                    transition-all
                    ${active
                      ? 'text-violet-300 bg-violet-500/10'
                      : 'text-white/55 hover:text-white hover:bg-white/5'}
                  `}>
                  {label}
                </Link>
              )
            })}

            <div className="pt-2 px-1">
              <div className="flex items-center gap-2.5 p-3 mb-2 rounded-xl
                              bg-ink-800 border border-white/8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700
                                flex items-center justify-center font-display font-bold text-sm text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-white">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-2xs text-white/40 capitalize">{user?.role}</p>
                </div>
              </div>
              <Link to="/dashboard" className="btn btn-primary w-full justify-center">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}