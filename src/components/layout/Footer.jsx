import { Link } from 'react-router-dom'

const LINKS = {
  Platform: [
    { label: 'Courses',   to: '/courses'   },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Pricing',   to: '#'          },
    { label: 'Roadmaps',  to: '#'          },
  ],
  Company: [
    { label: 'About',    to: '#' },
    { label: 'Blog',     to: '#' },
    { label: 'Careers',  to: '#' },
    { label: 'Press',    to: '#' },
  ],
  Legal: [
    { label: 'Privacy',  to: '#' },
    { label: 'Terms',    to: '#' },
    { label: 'Cookies',  to: '#' },
  ],
}

const SOCIALS = [
  { label: 'X',        icon: '𝕏', href: '#' },
  { label: 'LinkedIn', icon: 'in', href: '#' },
  { label: 'GitHub',   icon: '⌥',  href: '#' },
  { label: 'YouTube',  icon: '▶',  href: '#' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/6 mt-32">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand col */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700
                              flex items-center justify-center
                              group-hover:scale-110 transition-transform">
                <span className="font-display font-black text-sm text-white">L</span>
              </div>
              <span className="font-display font-extrabold text-lg text-gradient-violet">LearnPro</span>
            </Link>

            <p className="font-body text-sm leading-relaxed max-w-xs mb-6"
               style={{ color: 'var(--text-muted)' }}>
              Empowering ambitious learners worldwide with world-class courses, 
              AI mentorship, and a thriving community.
            </p>

            {/* Socials */}
            <div className="flex gap-2">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="
                    w-9 h-9 rounded-xl bg-ink-800 border border-white/8
                    flex items-center justify-center text-xs font-display font-bold
                    text-white/40 hover:text-violet-300 hover:border-violet-500/40
                    transition-all duration-200 hover:-translate-y-0.5
                  ">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="section-eyebrow mb-4">{group}</p>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}
                      className="text-sm font-body transition-colors hover:text-white"
                      style={{ color: 'var(--text-muted)' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body" style={{ color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} LearnPro Technologies. All rights reserved.
          </p>
          <p className="text-xs font-body flex items-center gap-1.5" style={{ color: 'var(--text-dim)' }}>
            Crafted with <span className="text-violet-400">♥</span> using React · Tailwind · Groq AI
          </p>
        </div>
      </div>
    </footer>
  )
}