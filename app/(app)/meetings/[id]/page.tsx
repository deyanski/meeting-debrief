import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ActionItemChecklist } from './ActionItemChecklist'
import { DeleteMeetingButton } from './DeleteMeetingButton'
import { CopyButton } from './CopyButton'

type Props = {
  params: Promise<{ id: string }>
}

export default async function MeetingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) notFound()

  // Scope to user_id — User B visiting User A's meeting gets null → notFound() = 404
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, title, date, summary, decisions, blockers, follow_up_email, raw_transcript, created_at')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (!meeting) notFound()

  const { data: actionItems } = await supabase
    .from('action_items')
    .select('id, text, owner, completed_at, created_at')
    .eq('meeting_id', id)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  const items = actionItems ?? []
  const decisions = (meeting.decisions as string[]) ?? []
  const blockers = (meeting.blockers as string[]) ?? []

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 flex-wrap gap-3"
        style={{
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-4">
          <a
            href="/meetings"
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            ← Meetings
          </a>
        </div>
        <DeleteMeetingButton meetingId={meeting.id} />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Title + meta */}
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-2"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
          >
            {meeting.date}
          </p>
          <h1
            className="text-4xl leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              color: 'var(--color-text)',
            }}
          >
            {meeting.title}
          </h1>
        </div>

        {/* Summary */}
        <Section label="Summary">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {meeting.summary}
          </p>
        </Section>

        {/* Action Items */}
        <Section label={`Action Items${items.length > 0 ? ` (${items.filter(i => !i.completed_at).length} open)` : ''}`}>
          <ActionItemChecklist items={items} meetingId={meeting.id} />
        </Section>

        {/* Decisions */}
        {decisions.length > 0 && (
          <Section label="Decisions">
            <ul className="flex flex-col gap-2">
              {decisions.map((d, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Blockers */}
        {blockers.length > 0 && (
          <Section label="Blockers">
            <ul className="flex flex-col gap-2">
              {blockers.map((b, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span style={{ color: 'var(--color-destructive)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    ⚠
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Follow-up email */}
        <Section
          label="Follow-up Email"
          action={<CopyButton text={meeting.follow_up_email} />}
        >
          <pre
            className="text-sm leading-relaxed whitespace-pre-wrap rounded-sm p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              border: '1px solid var(--color-border)',
            }}
          >
            {meeting.follow_up_email}
          </pre>
        </Section>

        {/* Raw transcript — collapsible */}
        <details className="group">
          <summary
            className="cursor-pointer text-xs tracking-widest uppercase select-none transition-opacity hover:opacity-60 list-none flex items-center gap-2"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            <span className="transition-transform group-open:rotate-90 inline-block">▶</span>
            Raw Transcript
          </summary>
          <pre
            className="mt-3 text-sm leading-relaxed whitespace-pre-wrap rounded-sm p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              border: '1px solid var(--color-border)',
            }}
          >
            {meeting.raw_transcript}
          </pre>
        </details>
      </main>
    </div>
  )
}

function Section({
  label,
  action,
  children,
}: {
  label: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          {label}
        </h2>
        {action}
      </div>
      <div
        className="w-full h-px"
        style={{ backgroundColor: 'var(--color-border)' }}
        aria-hidden="true"
      />
      {children}
    </div>
  )
}
