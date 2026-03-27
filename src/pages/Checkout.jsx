import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import api from '../services/api'
import { MOCK_COURSES } from '../data/mockData'
import { formatPrice, formatDuration } from '../utils/helpers'

const formatCard   = (v) => v.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19)
const formatExpiry = (v) => v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'$1/$2').slice(0,5)

export default function Checkout() {
  const { id }              = useParams()
  const { user }            = useAuth()
  const navigate            = useNavigate()
  const [course,   setCourse]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [paying,   setPaying]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/checkout/${id}` } } }); return }
    api.get(`/courses/${id}`)
      .then(r  => setCourse(r.data.course || r.data))
      .catch(() => setCourse(MOCK_COURSES.find(c => c._id === id) || MOCK_COURSES[0]))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  const handleCard = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'number') v = formatCard(value)
    if (name === 'expiry') v = formatExpiry(value)
    if (name === 'cvv')    v = value.replace(/\D/g,'').slice(0,4)
    setCard(p => ({ ...p, [name]: v }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (card.number.replace(/\s/g,'').length < 16)  e.number = 'Enter a valid 16-digit card number'
    if (!/^\d{2}\/\d{2}$/.test(card.expiry))        e.expiry = 'Use MM/YY format'
    if (card.cvv.length < 3)                        e.cvv    = '3 or 4 digit CVV required'
    if (!card.name.trim())                          e.name   = 'Cardholder name required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setPaying(true)
    try {
      await new Promise(r => setTimeout(r, 2200))
      await api.post(`/enroll/${id}`)
      setSuccess(true)
    } catch {
      alert('Payment failed. Use test card: 4242 4242 4242 4242')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading checkout…" />
    </div>
  )

  /* ── Success screen ─────────────────────────────── */
  if (success) return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full text-center card p-12 rounded-3xl animate-scale-in space-y-6">
        <div className="w-24 h-24 mx-auto rounded-3xl
                        bg-emerald-500/15 border-2 border-emerald-500/40
                        flex items-center justify-center text-5xl">
          ✅
        </div>
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white mb-2">
            Payment Successful!
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
            You're now enrolled in{' '}
            <span className="text-white font-display font-semibold">{course?.title}</span>.
            Start your learning journey right away!
          </p>
        </div>
        <div className="space-y-3">
          <Link to={`/courses/${id}`} className="btn btn-primary w-full justify-center py-4 text-base">
            Start Learning →
          </Link>
          <Link to="/dashboard" className="btn btn-ghost w-full justify-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen pt-24 pb-24 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link to={`/courses/${id}`}
          className="inline-flex items-center gap-2 font-body text-sm mb-8
                     transition-colors hover:text-white"
          style={{ color: 'var(--text-muted)' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to course
        </Link>

        <div className="mb-10 animate-fade-up">
          <p className="section-eyebrow mb-2">Checkout</p>
          <h1 className="section-title">Complete Your Purchase</h1>
        </div>

        <div className="grid md:grid-cols-5 gap-8">

          {/* ── Payment Form ─────────────────────── */}
          <div className="md:col-span-3 animate-fade-up opacity-0"
               style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="card p-7 rounded-3xl">

              {/* Secure header */}
              <div className="flex items-center justify-between mb-7 pb-5 border-b border-white/6">
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <span className="text-emerald-400">🔒</span> Payment Details
                </h2>
                <span className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                  Secured by Stripe
                </span>
              </div>

              <form onSubmit={handlePay} className="space-y-5" noValidate>

                {/* Card number */}
                <div>
                  <label className="block font-display font-medium text-sm mb-2"
                         style={{ color: 'var(--text-muted)' }}>
                    Card Number
                  </label>
                  <input type="text" name="number" value={card.number}
                    onChange={handleCard} placeholder="4242 4242 4242 4242"
                    className={`input font-mono tracking-widest ${errors.number ? 'border-rose-500' : ''}`} />
                  {errors.number && (
                    <p className="text-rose-400 text-xs mt-1.5 font-body">{errors.number}</p>
                  )}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-display font-medium text-sm mb-2"
                           style={{ color: 'var(--text-muted)' }}>
                      Expiry Date
                    </label>
                    <input type="text" name="expiry" value={card.expiry}
                      onChange={handleCard} placeholder="MM/YY"
                      className={`input font-mono ${errors.expiry ? 'border-rose-500' : ''}`} />
                    {errors.expiry && (
                      <p className="text-rose-400 text-xs mt-1.5 font-body">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-display font-medium text-sm mb-2"
                           style={{ color: 'var(--text-muted)' }}>
                      CVV
                    </label>
                    <input type="text" name="cvv" value={card.cvv}
                      onChange={handleCard} placeholder="123"
                      className={`input font-mono ${errors.cvv ? 'border-rose-500' : ''}`} />
                    {errors.cvv && (
                      <p className="text-rose-400 text-xs mt-1.5 font-body">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="block font-display font-medium text-sm mb-2"
                         style={{ color: 'var(--text-muted)' }}>
                    Cardholder Name
                  </label>
                  <input type="text" name="name" value={card.name}
                    onChange={handleCard} placeholder="Full name on card"
                    className={`input ${errors.name ? 'border-rose-500' : ''}`} />
                  {errors.name && (
                    <p className="text-rose-400 text-xs mt-1.5 font-body">{errors.name}</p>
                  )}
                </div>

                {/* Test hint */}
                <div className="p-4 rounded-xl border border-white/6"
                     style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <p className="font-body text-xs" style={{ color: 'var(--text-dim)' }}>
                    🧪 Test mode: use card{' '}
                    <span className="font-mono text-violet-300">4242 4242 4242 4242</span>
                    {' '}· any future expiry · any CVV
                  </p>
                </div>

                {/* Submit */}
                <button type="submit" disabled={paying}
                  className="btn btn-primary w-full justify-center py-4 text-base">
                  {paying ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white
                                       rounded-full animate-spin" />
                      Processing payment…
                    </>
                  ) : (
                    `Pay ${formatPrice(course?.price || 0)} →`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Order Summary ─────────────────────── */}
          <div className="md:col-span-2 animate-fade-up opacity-0"
               style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div className="card p-6 rounded-3xl sticky top-24 space-y-5">
              <h2 className="font-display font-bold text-lg text-white">Order Summary</h2>

              {/* Course preview */}
              <div className="flex gap-4 pb-5 border-b border-white/6">
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-ink-900 flex-shrink-0">
                  {course?.thumbnail
                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-violet-900/30 flex items-center justify-center text-lg">📚</div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-white text-sm leading-snug line-clamp-2">
                    {course?.title}
                  </p>
                  {course?.duration && (
                    <p className="font-body text-2xs mt-1" style={{ color: 'var(--text-dim)' }}>
                      ⏱ {formatDuration(course.duration)}
                    </p>
                  )}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 font-body text-sm">
                <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                  <span>Original Price</span>
                  <span className="line-through">{formatPrice((course?.price || 0) * 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">Discount (50%)</span>
                  <span className="text-emerald-400">−{formatPrice(course?.price || 0)}</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between font-display font-bold text-white text-xl">
                  <span>Total</span>
                  <span className="text-gradient-violet">{formatPrice(course?.price || 0)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-2 space-y-2">
                {[
                  '🛡 30-day money-back guarantee',
                  '♾️ Lifetime access to content',
                  '🏆 Certificate of completion',
                ].map(item => (
                  <p key={item}
                     className="font-body text-xs flex items-center gap-2"
                     style={{ color: 'var(--text-muted)' }}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}