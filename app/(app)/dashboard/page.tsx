import { createClient } from '@/lib/supabase/server'
import { ActionItemChecklist } from '../meetings/[id]/ActionItemChecklist'
import { SignOutButton } from '@/components/SignOutButton'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // All open action items across all meetings, oldest first
  const { data: openItems } = await supabase
    .from('action_items')
    .select('id, text, owner, completed_at, created_at, meeting_id, meetings(id, title)')
    .eq('user_id', session!.user.id)
    .is('completed_at', null)
    .order('created_at', { ascending: true })

  const items = openItems ?? []

  type MeetingGroup = {
    meetingId: string
    meetingTitle: string
    items: { id: string; text: string; owner: string | null; completed_at: string | null }[]
  }

  const grouped = items.reduce<MeetingGroup[]>((acc, item) => {
    const meeting = item.meetings as { id: string; title: string } | null
    if (!meeting) return acc
    let group = acc.find((g) => g.meetingId === meeting.id)
    if (!group) {
      group = { meetingId: meeting.id, meetingTitle: meeting.title, items: [] }
      acc.push(group)
    }
    group.items.push({ id: item.id, text: item.text, owner: item.owner, completed_at: item.completed_at })
    return acc
  }, [])

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-background)' }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
        >
          Meeting Debrief
        </span>
        <div className="flex items-center gap-6">
          <a
            href="/meetings"
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            All Meetings →
          </a>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div>
          <h1
            className="text-4xl mb-1"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-text)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Open action items across all meetings
          </p>
        </div>

        {items.length === 0 && (
          <div
            className="rounded-sm p-12 text-center flex flex-col items-center gap-4"
            style={{ border: '1px dashed var(--color-border)' }}
          >
            <span className="text-4xl" aria-hidden="true">✓</span>
            <p
              className="text-xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
              All caught up
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No open action items across any of your meetings.
            </p>
            <a
              href="/meetings/new"
              className="mt-2 px-5 py-2 rounded-sm text-sm transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }}
            >
              New meeting
            </a>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.meetingId} className="flex flex-col gap-4">
            <div>
              <a
                href={`/meetings/${group.meetingId}`}
                className="text-base font-medium transition-opacity hover:opacity-60"
                style={{ color: 'var(--color-text)', textDecoration: 'none' }}
              >
                {group.meetingTitle}
              </a>
              <div className="w-full h-px mt-2" style={{ backgroundColor: 'var(--color-border)' }} aria-hidden="true" />
            </div>
            <ActionItemChecklist items={group.items} meetingId={group.meetingId} />
          </div>
        ))}

        {items.length > 0 && (
          <div className="flex justify-end pb-4">
            <a
              href="/meetings/new"
              className="text-xs tracking-wider uppercase transition-opacity hover:opacity-60"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
            >
              + New meeting
            </a>
          </div>
        )}
      </main>
    </div>
  )
}


