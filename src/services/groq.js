import Groq from 'groq-sdk'

const createClient = () => {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key || key === 'gsk_your_groq_key_here' || key.length < 10) {
    console.warn('⚠️  GROQ API key not configured in client/.env')
    return null
  }
  return new Groq({ apiKey: key, dangerouslyAllowBrowser: true })
}

let client = null
const getClient = () => {
  if (!client) client = createClient()
  return client
}

export const SYSTEM_PROMPT = `You are LearnBot — the AI learning assistant embedded inside LearnPro, a premium EdTech platform.

Your personality: warm, concise, motivating, and genuinely knowledgeable about learning science.

You help students with:
- Finding the right courses for their goals
- Study strategies (spaced repetition, active recall, Pomodoro technique)
- Explaining complex concepts clearly and simply
- Staying motivated and building consistent learning habits
- Navigating the LearnPro platform

Rules:
- Keep replies short and scannable. Use bullet points when listing 3 or more items.
- Never make up course titles, instructors, or prices that you don't know for certain.
- If asked something completely unrelated to learning or education, politely redirect.
- Address the student by their first name when you know it.
- End responses with a brief encouraging nudge when it feels natural.`

const MODEL = 'llama-3.1-8b-instant'

export async function askGroq(messages, userName = '') {
  const groq = getClient()

  if (!groq) {
    return "I'm not configured yet. Please add your GROQ API key to the `client/.env` file as `VITE_GROQ_API_KEY=gsk_...` and restart the dev server."
  }

  const systemContent = SYSTEM_PROMPT +
    (userName ? `\n\nThe student's name is ${userName}.` : '')

  const formatted = messages
    .filter(m => m.sender !== 'system')
    .map(m => ({
      role:    m.sender === 'user' ? 'user' : 'assistant',
      content: m.text || '',
    }))
    .slice(-20)

  try {
    const completion = await groq.chat.completions.create({
      model:       MODEL,
      temperature: 0.72,
      max_tokens:  900,
      top_p:       0.95,
      messages: [
        { role: 'system', content: systemContent },
        ...formatted,
      ],
    })

    const text = completion.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error('Empty response from Groq')
    return text
  } catch (err) {
    const status = err?.status || err?.response?.status
    if (status === 401) return "My API key seems invalid. Please check the `VITE_GROQ_API_KEY` value in `client/.env`."
    if (status === 429) return "⏳ I'm getting a lot of requests right now. Please wait a moment and try again."
    if (status === 503) return "The AI model is temporarily unavailable. Please try again in a moment."
    console.error('Groq error:', err?.message || err)
    return "I had trouble connecting. Please check your internet connection and try again."
  }
}