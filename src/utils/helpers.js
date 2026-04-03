export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const formatPrice = (cents) => {
  if (cents === 0) return 'Free'
  return `$${(cents / 100).toFixed(2)}`
}

export const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export const truncate = (str, n) =>
  str && str.length > n ? str.slice(0, n).trimEnd() + '…' : str || ''

export const levelStyle = (level) => {
  const map = {
    Beginner:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    Intermediate: 'bg-amber-500/15   text-amber-400   border-amber-500/25',
    Advanced:     'bg-rose-500/15    text-rose-400    border-rose-500/25',
  }
  return map[level] || 'bg-violet-500/15 text-violet-400 border-violet-500/25'
}

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

export const compactNum = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}