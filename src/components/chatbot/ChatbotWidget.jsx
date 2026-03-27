import { useState, useRef, useEffect, useCallback } from 'react'
import { askGroq }  from '../../services/groq'
import { useAuth }  from '../../context/AuthContext'

const BOT_INTRO = {
  id:     'intro',
  sender: 'bot',
  text:   "👋 Hi! I'm **LearnBot**, your AI study companion.\n\nI can help you:\n- Find the perfect courses for your goals\n- Share proven study strategies\n- Explain complex concepts simply\n- Keep you motivated and on track\n\nWhat are you looking to learn today?",
  time:   Date.now(),
}

const QUICK_REPLIES = [
  { label: '📚 Recommend a course',    text: 'Can you recommend a good course for me?' },
  { label: '💡 Study tips',            text: 'What are the best study strategies for online learning?' },
  { label: '🎯 Build a learning plan', text: 'Help me build a weekly learning plan' },
  { label: '🔰 For beginners',         text: 'I am a complete beginner. Where should I start?' },
]

/* Simple inline markdown → JSX */
function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return null
        const isBullet = /^[-•*]\s/.test(line.trim())
        const content  = line
          .replace(/^[-•*]\s/, '')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-violet-900/40 text-violet-300 rounded px-1 text-xs font-mono">$1</code>')

        return isBullet ? (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-violet-400 flex-shrink-0 mt-0.5 text-xs">◆</span>
            <span
              className="leading-snug"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          <p key={i} className="leading-snug"
             dangerouslySetInnerHTML={{ __html: content }} />
        )
      })}
    </div>
  )
}

export default function ChatbotWidget() {
  const { user }   = useAuth()
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([BOT_INTRO])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const abortRef   = useRef(null)

  /* Auto-scroll to latest message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* Focus input when opened */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  /* Cleanup abort on unmount */
  useEffect(() => () => abortRef.current?.abort(), [])

  const send = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return

    setError(null)
    setInput('')

    const userMsg = { id: Date.now(), sender: 'user', text, time: Date.now() }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const reply = await askGroq(history, user?.name?.split(' ')[0] || '')
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: reply, time: Date.now() },
      ])
    } catch (err) {
      const msg = err?.status === 429
        ? "⏳ I'm receiving a lot of requests right now. Please wait a moment and try again."
        : "⚠️ I lost my connection for a second. Please try again."
      setError(msg)
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: msg, time: Date.now() },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, user])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clearChat = () => {
    setMessages([BOT_INTRO])
    setError(null)
  }

  const ts = (t) => new Date(t).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  const showQuickReplies = messages.length <= 1

  return (
    <>
      {/* ── Floating Trigger ──────────────────────── */}
      <button
        onClick={() => setOpen(p => !p)}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-2xl flex items-center justify-center
          bg-gradient-to-br from-violet-600 to-violet-800
          shadow-violet-md hover:shadow-violet-lg
          transition-all duration-300 ease-spring
          ${open ? 'scale-90 rotate-12' : 'scale-100 hover:scale-110 hover:-translate-y-1'}
        `}
      >
        <span className="text-2xl transition-all duration-200">
          {open ? '✕' : '🤖'}
        </span>
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl ring-2 ring-violet-500/40 animate-ping
                           pointer-events-none opacity-75" />
        )}
      </button>

      {/* ── Chat Panel ────────────────────────────── */}
      <div
        role="dialog"
        aria-label="LearnBot AI assistant"
        className={`
          fixed bottom-24 right-6 z-50
          flex flex-col
          w-[380px] max-w-[calc(100vw-24px)]
          rounded-2xl overflow-hidden
          border border-white/10
          shadow-2xl shadow-black/60
          transition-all duration-300 ease-spring
          origin-bottom-right
          ${open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0   scale-95  translate-y-4 pointer-events-none'}
        `}
        style={{ height: '560px' }}
      >

        {/* ── Header ──────────────────────────────── */}
        <div className="
          flex items-center gap-3 px-4 py-3.5 flex-shrink-0
          bg-gradient-to-r from-violet-800 to-violet-700
          border-b border-violet-600/30
        ">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-violet-600/50 border border-violet-500/40
                            flex items-center justify-center text-xl">
              🤖
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full
                             bg-emerald-400 border-2 border-violet-800 animate-pulse" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-white text-sm leading-none">LearnBot</h3>
            <p className="text-violet-300/70 text-2xs mt-0.5 font-body">
              Powered by Groq · Llama 3 · Online
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="p-1.5 rounded-lg text-violet-300/60 hover:text-violet-200
                         hover:bg-violet-600/30 transition-all text-xs font-display font-medium"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Close"
              className="p-1.5 rounded-lg text-violet-300/60 hover:text-violet-200
                         hover:bg-violet-600/30 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" fill="none"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-ink-900 px-4 py-4 space-y-3 no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 items-end animate-fade-up
                ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Bot avatar */}
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800
                                flex items-center justify-center text-sm flex-shrink-0 mb-0.5">
                  🤖
                </div>
              )}

              {/* Bubble */}
              <div className={`
                max-w-[78%] rounded-2xl px-4 py-3 text-sm
                ${msg.sender === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-sm'
                  : 'bg-ink-800 border border-white/8 text-white/90 rounded-bl-sm'}
              `}>
                {msg.sender === 'bot'
                  ? <MessageText text={msg.text} />
                  : <p className="whitespace-pre-wrap leading-snug">{msg.text}</p>
                }
                <p className={`text-2xs mt-2 select-none
                  ${msg.sender === 'user' ? 'text-white/40 text-right' : 'text-white/25'}`}>
                  {ts(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-2 items-end animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800
                              flex items-center justify-center text-sm flex-shrink-0">
                🤖
              </div>
              <div className="bg-ink-800 border border-white/8 rounded-2xl rounded-bl-sm
                              px-4 py-3.5 flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <span key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce-dot"
                    style={{ animationDelay: `${i * 0.16}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Quick Replies ────────────────────────── */}
        {showQuickReplies && (
          <div className="bg-ink-900 border-t border-white/5 px-4 pt-3 pb-2 flex-shrink-0">
            <p className="text-2xs font-display font-semibold uppercase tracking-wider
                          text-white/25 mb-2">
              Quick start
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr.text}
                  onClick={() => send(qr.text)}
                  className="
                    text-2xs px-2.5 py-1.5 rounded-xl
                    bg-ink-800 border border-white/8
                    text-white/55 hover:text-white
                    hover:border-violet-500/40 hover:bg-violet-500/8
                    transition-all duration-150 font-body
                  "
                >
                  {qr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ───────────────────────────────── */}
        <div className="bg-ink-950/80 border-t border-white/6 p-3 flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about learning…"
              className="
                flex-1 input text-sm resize-none
                min-h-[44px] max-h-[120px]
                py-3 leading-snug
              "
              style={{ fieldSizing: 'content' }}
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="
                w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center
                bg-violet-600 hover:bg-violet-500
                disabled:opacity-30 disabled:cursor-not-allowed
                shadow-violet-sm hover:shadow-violet-md
                transition-all duration-200
                hover:-translate-y-0.5 active:translate-y-0
              "
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M10 4l4 4-4 4" stroke="white" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="text-2xs text-center mt-2 font-body" style={{ color: 'var(--text-dim)' }}>
            ↵ Enter to send · Shift+↵ for new line
          </p>
        </div>
      </div>
    </>
  )
}