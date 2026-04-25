import OpenAI from 'openai'

// OPENROUTER_API_KEY is server-only — never expose to client
export const openRouterClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    'X-Title': 'Meeting Debrief',
  },
})
