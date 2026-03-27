import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login }        = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const from             = location.state?.from?.pathname || '/dashboard'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
      {/* Bg orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3
                        w-72 h-72 rounded-full bg-amber-500/6 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="card p-8 md:p-10 rounded-3xl animate-fade-up">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700
                              flex items-center justify-center
                              group-hover:scale-110 transition-transform shadow-violet-sm">
                <span className="font-display font-black text-base text-white">L</span>
              </div>
              <span className="font-display font-extrabold text-xl text-gradient-violet">
                LearnPro
              </span>
            </Link>
            <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
            <p className="font-body text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex gap-2.5 p-4 rounded-xl
                            bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm font-body">
              <span className="flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block font-display font-medium text-sm mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className="input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-display font-medium text-sm"
                       style={{ color: 'var(--text-muted)' }}>
                  Password
                </label>
                <a href="#" className="text-xs font-body text-violet-400
                                       hover:text-violet-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-white/30 hover:text-white/60 transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3.5 text-base mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                   rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign In <span>→</span></>
              )}
            </button>
          </form>

          <p className="text-center font-body text-sm mt-6"
             style={{ color: 'var(--text-dim)' }}>
            Don't have an account?{' '}
            <Link to="/register"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-4 rounded-2xl text-center border border-white/6"
             style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="font-body text-2xs mb-1" style={{ color: 'var(--text-dim)' }}>
            Demo credentials
          </p>
          <p className="font-body text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            student@learnpro.dev · password123
          </p>
        </div>
      </div>
    </main>
  )
}