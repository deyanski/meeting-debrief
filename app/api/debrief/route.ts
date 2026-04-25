import { createClient } from '@/lib/supabase/server'
import { openRouterClient } from '@/lib/ai/client'
import { parseDebriefResponse } from '@/lib/ai/parseDebriefResponse'
import { DEBRIEF_SYSTEM_PROMPT } from '@/lib/ai/prompt'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const InputSchema = z.object({
  transcript: z.string().min(1, 'Transcript is required'),
})

export async function POST(request: NextRequest) {
  // 1. Auth check — derive user server-side, never trust client
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2. Input validation
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Bad input' },
      { status: 400 }
    )
  }

  const { transcript } = parsed.data

  // 3. Call OpenRouter
  let rawContent: string
  try {
    const completion = await openRouterClient.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: DEBRIEF_SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
    })
    rawContent = completion.choices[0]?.message?.content ?? ''
  } catch {
    // Network error or OpenRouter failure — never expose details
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }

  // 4. Parse and validate AI response through Zod
  try {
    const result = parseDebriefResponse(rawContent)
    return NextResponse.json(result)
  } catch {
    // JSON parse failure or schema mismatch — never expose schema structure
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
