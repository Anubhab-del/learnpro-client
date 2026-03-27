/* Duration: minutes → "2h 30m" */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/* Price: cents → "$49.99" or "Free" */
export const formatPrice = (cents) => {
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(2)}`
}

/* Date → "Mar 25, 2026" */
export const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

/* Truncate string */
export const truncate = (str, n) =>
  str && str.length > n ? str.slice(0, n).trimEnd() + '…' : str || ''

/* Level → badge color classes */
export const levelStyle = (level) => {
  const map = {
    Beginner:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    Intermediate: 'bg-amber-500/15   text-amber-400   border-amber-500/25',
    Advanced:     'bg-rose-500/15    text-rose-400    border-rose-500/25',
  }
  return map[level] || 'bg-violet-500/15 text-violet-400 border-violet-500/25'
}

/* Category → emoji */
export const categoryIcon = (cat) => {
  const map = {
    'Web Development': '🌐',
    'AI & ML':         '🤖',
    'Data Science':    '📊',
    'UI/UX Design':    '🎨',
    'Mobile Dev':      '📱',
    'DevOps':          '⚙️',
    'Cloud Computing': '☁️',
    'Cybersecurity':   '🔐',
  }
  return map[cat] || '📚'
}

/* Rating → star string */
export const starRating = (rating = 0) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
}

/* Number → compact "12.4k" */
export const compactNum = (n) => {
  if (!n) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}