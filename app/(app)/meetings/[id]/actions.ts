'use server'

import { createClient } from '@/lib/supabase/server'
import { toggleActionItem } from '@/lib/utils/actionItems'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// ── Toggle action item ────────────────────────────────────────────────────────

export async function updateActionItem(
  id: string,
  currentCompletedAt: string | null
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'unauthorized' }

  const newCompletedAt = toggleActionItem(currentCompletedAt)

  const { error } = await supabase
    .from('action_items')
    .update({ completed_at: newCompletedAt })
    // Always scope to user_id — never trust client to enforce this
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { error: 'Failed to update action item' }

  revalidatePath('/dashboard')
  revalidatePath('/meetings/[id]', 'page')
}

// ── Add action item ───────────────────────────────────────────────────────────

const AddItemSchema = z.object({
  meetingId: z.string().uuid(),
  text: z.string().min(1).max(500),
})

export async function addActionItem(
  meetingId: string,
  text: string
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'unauthorized' }

  const parsed = AddItemSchema.safeParse({ meetingId, text })
  if (!parsed.success) return { error: 'Invalid input' }

  // Verify the meeting belongs to this user before inserting
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id')
    .eq('id', meetingId)
    .eq('user_id', session.user.id)
    .single()

  if (!meeting) return { error: 'Meeting not found' }

  const { error } = await supabase.from('action_items').insert({
    meeting_id: meetingId,
    user_id: session.user.id,
    text: parsed.data.text,
    owner: null,
  })

  if (error) return { error: 'Failed to add action item' }

  revalidatePath(`/meetings/${meetingId}`)
}

// ── Delete meeting ────────────────────────────────────────────────────────────

export async function deleteMeeting(
  meetingId: string
): Promise<{ error: string } | never> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'unauthorized' }

  if (!z.string().uuid().safeParse(meetingId).success) {
    return { error: 'Invalid meeting ID' }
  }

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', meetingId)
    .eq('user_id', session.user.id)

  if (error) return { error: 'Failed to delete meeting' }

  redirect('/meetings')
}
