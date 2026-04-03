import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Trash2 } from 'lucide-react';
import api from '../utils/api';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm LearnPro AI 🚀 Your personal learning assistant. Ask me anything — course recommendations, study tips, or tech explanations. How can I help you today?"
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content
        }))
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ]);
    } catch (err) {
      const errMsg = err.response?.data?.error || "Sorry, I couldn't connect right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errMsg }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
          style={{
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(520px, calc(100vh - 120px))',
            background: 'rgba(10, 0, 32, 0.95)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(219,39,119,0.4))' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">LearnPro AI</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white/60 text-xs">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center shrink-0 mt-1 mr-2">
                    <Bot className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                )}
                <div
                  className="max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(219,39,119,0.5))'
                        : 'rgba(255,255,255,0.06)',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: '#f8fafc',
                    borderRadius:
                      msg.role === 'user'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px'
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center shrink-0 mt-1 mr-2">
                  <Bot className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px 18px 18px 4px'
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-3 border-t border-white/10">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about learning..."
                rows={1}
                className="flex-1 cosmic-input rounded-xl px-3 py-2.5 text-sm resize-none"
                style={{ maxHeight: '80px', minHeight: '40px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="btn-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-white/25 text-xs mt-1.5 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center animate-glow-pulse"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #db2777 100%)'
        }}
        aria-label="Toggle AI chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}

        {/* Pulse ring */}
        {!isOpen && (
          <span
            className="absolute w-full h-full rounded-full animate-ping opacity-40"
            style={{ background: 'rgba(168,85,247,0.6)' }}
          />
        )}
      </button>
    </>
  );
}
