import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { value: 'student',    label: 'Student',    icon: '🎓', desc: 'I want to learn new skills'  },
  { value: 'instructor', label: 'Instructor', icon: '🧑‍🏫', desc: 'I want to teach and share knowledge' },
]

export default function Register() {
  const { register }      = useAuth()
  const navigate          = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '', role: 'student' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* Password strength */
  const strength = (() => {
    const p = form.password
    if (!p) return null
    if (p.length < 6)                            return { level: 1, label: 'Too short',   color: 'bg-rose-500'   }
    if (p.length < 8)                            return { level: 2, label: 'Weak',        color: 'bg-amber-500'  }
    if (/[A-Z]/.test(p) && /[0-9]/.test(p))     return { level: 4, label: 'Strong',      color: 'bg-emerald-500'}
    return                                                { level: 3, label: 'Fair',        color: 'bg-amber-400'  }
  })()

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/3
                        w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4
                        w-72 h-72 rounded-full bg-amber-500/6 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-md">
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
            <h1 className="font-display font-bold text-2xl text-white">Create your account</h1>
            <p className="font-body text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Start your learning journey — it's free forever
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex gap-2.5 p-4 rounded-xl
                            bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm font-body">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="block font-display font-medium text-sm mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input type="text" value={form.name} onChange={set('name')}
                placeholder="Alex Johnson" autoComplete="name"
                className="input" required />
            </div>

            {/* Email */}
            <div>
              <label className="block font-display font-medium text-sm mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com" autoComplete="email"
                className="input" required />
            </div>

            {/* Password */}
            <div>
              <label className="block font-display font-medium text-sm mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} placeholder="Min. 6 characters"
                  autoComplete="new-password" className="input pr-12" required />
                <button type="button" onClick={() => setShowPw(p => !p)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-white/30 hover:text-white/60 transition-colors text-sm">
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {/* Strength meter */}
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300
                          ${i <= strength.level ? strength.color : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                  <span className="text-2xs font-body" style={{ color: 'var(--text-dim)' }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block font-display font-medium text-sm mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.confirm}
                  onChange={set('confirm')} placeholder="Repeat your password"
                  autoComplete="new-password" className="input pr-10" required />
                {form.confirm && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm">
                    {form.confirm === form.password ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block font-display font-medium text-sm mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                I am joining as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    className={`
                      p-4 rounded-xl text-left border transition-all duration-200
                      ${form.role === r.value
                        ? 'bg-violet-500/15 border-violet-500/50 text-white'
                        : 'bg-ink-800 border-white/8 text-white/50 hover:text-white hover:border-white/15'}
                    `}>
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="font-display font-semibold text-sm">{r.label}</div>
                    <div className="font-body text-2xs mt-0.5 leading-tight"
                         style={{ color: 'var(--text-dim)' }}>
                      {r.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn btn-primary w-full justify-center py-3.5 text-base mt-2">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>Create Account <span>→</span></>
              )}
            </button>
          </form>

          <p className="text-center font-body text-sm mt-6" style={{ color: 'var(--text-dim)' }}>
            Already have an account?{' '}
            <Link to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center font-body text-2xs mt-4 leading-relaxed"
             style={{ color: 'var(--text-dim)' }}>
            By registering you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  )
}