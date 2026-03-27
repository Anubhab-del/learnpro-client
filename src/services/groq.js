import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

export const SYSTEM_PROMPT = `You are LearnBot — the AI learning assistant embedded inside LearnPro, a premium EdTech platform.

Your personality: warm, concise, motivating, and genuinely knowledgeable about learning science.

You help students with:
- Finding the right courses for their goals
- Study strategies (spaced repetition, active recall, Pomodoro)
- Explaining complex concepts clearly
- Staying motivated and building consistent habits
- Navigating the platform

Rules:
- Keep replies short and scannable. Use bullet points when listing 3+ items.
- Never fabricate course titles, instructors, or prices.
- If asked something unrelated to learning, gently redirect.
- Address the student by their first name when you know it.
- End responses with a brief, encouraging nudge when appropriate.`

export async function askGroq(messages, userName = '') {
  const systemContent = SYSTEM_PROMPT +
    (userName ? `\n\nStudent's name: ${userName}.` : '')

  const formatted = messages
    .filter(m => m.sender !== 'system')
    .map(m => ({
      role:    m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

  const completion = await client.chat.completions.create({
    model:       'llama3-8b-8192',
    temperature: 0.72,
    max_tokens:  900,
    top_p:       0.95,
    messages: [
      { role: 'system', content: systemContent },
      ...formatted,
    ],
  })

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "I couldn't generate a response. Please try again."
  )
}