'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SaveMeetingSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  summary: z.string().min(1),
  decisions: z.array(z.string()),
  blockers: z.array(z.string()),
  follow_up_email: z.string(),
  raw_transcript: z.string().min(1),
  action_items: z.array(
    z.object({
      text: z.string().min(1),
      owner: z.string().nullable(),
    })
  ),
})

export async function saveMeeting(
  data: z.infer<typeof SaveMeetingSchema>
): Promise<{ error: string } | never> {
  const supabase = await createClient()

  // Always derive user_id server-side — never trust client-supplied value
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'unauthorized' }
  }

  const userId = session.user.id

  // Validate input at the server boundary
  const parsed = SaveMeetingSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Invalid meeting data' }
  }

  const {
    title, date, summary, decisions, blockers,
    follow_up_email, raw_transcript, action_items,
  } = parsed.data

  // Insert meeting
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      user_id: userId,
      title,
      date,
      summary,
      decisions,
      blockers,
      follow_up_email,
      raw_transcript,
    })
    .select('id')
    .single()

  if (meetingError || !meeting) {
    return { error: 'Failed to save meeting' }
  }

  // Insert action items (only if any exist)
  if (action_items.length > 0) {
    const { error: itemsError } = await supabase
      .from('action_items')
      .insert(
        action_items.map((item) => ({
          meeting_id: meeting.id,
          user_id: userId,
          text: item.text,
          owner: item.owner ?? null,
        }))
      )

    if (itemsError) {
      // Meeting saved but action items failed — still redirect, not a fatal error
      // Log would go here in production
    }
  }

  redirect(`/meetings/${meeting.id}`)
}
