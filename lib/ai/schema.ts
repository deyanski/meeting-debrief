import { z } from 'zod'

// Action item: owner is explicitly nullable — AI must not invent owners
export const ActionItemSchema = z.object({
  text: z.string().min(1),
  owner: z.string().nullable(),
})

// Successful debrief response
export const DebriefSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  summary: z.string().min(1),
  decisions: z.array(z.string()),
  action_items: z.array(ActionItemSchema),
  blockers: z.array(z.string()),
  follow_up_email: z.string(),
})

// Error response when transcript is not a meeting
export const NotAMeetingSchema = z.object({
  error: z.literal('not_a_meeting'),
})

// Discriminated union — either a valid debrief or an error signal
export const DebriefResponseSchema = z.union([DebriefSchema, NotAMeetingSchema])

export type ActionItem = z.infer<typeof ActionItemSchema>
export type Debrief = z.infer<typeof DebriefSchema>
export type NotAMeeting = z.infer<typeof NotAMeetingSchema>
export type DebriefResponse = z.infer<typeof DebriefResponseSchema>
