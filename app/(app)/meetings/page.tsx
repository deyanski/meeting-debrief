import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/SignOutButton'
import { SearchInput } from '@/components/SearchInput'
import { ThemeToggle } from '@/components/ThemeToggle'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function MeetingsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Get meetings with open action item count
  let dbQuery = supabase
    .from('meetings')
    .select('id, title, date, summary, created_at')
    .eq('user_id', session!.user.id)
    .order('created_at', { ascending: false })

  if (query) {
    // Split into words, sanitize tsquery special chars, append :* for prefix matching
    // to_tsquery('foo:*') matches 'football', 'foolish', etc. — works without full word
    const words = query.trim().split(/\s+/).filter(Boolean)
    const prefixQuery = words
      .map(w => w.replace(/[':&|!<>()*\\]/g, '').trim())
      .filter(w => w.length > 0)
      .map(w => `${w}:*`)
      .join(' & ')

    if (prefixQuery) {
      // no type option = to_tsquery, which supports the :* prefix operator
      dbQuery = dbQuery.textSearch('fts', prefixQuery)
    }
  }

  const { data: meetings } = await dbQuery

  // Separate query for open action item counts (avoids complex join)
  const { data: openItems } = await supabase
    .from('action_items')
    .select('meeting_id')
    .eq('user_id', session!.user.id)
    .is('completed_at', null)

  const openCountByMeeting = (openItems ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.meeting_id] = (acc[item.meeting_id] ?? 0) + 1
    return acc
  }, {})

  const meetingList = meetings ?? []
  const hasNoMeetingsAtAll = !query && meetingList.length === 0
  const hasNoSearchResults = query && meetingList.length === 0

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
        <a
          href="/dashboard"
          className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          ← Dashboard
        </a>
        <a
          href="/meetings/new"
          className="px-4 py-2 rounded-sm text-xs tracking-wider uppercase transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-background)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          + New Meeting
        </a>
        <ThemeToggle />
        <SignOutButton />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1
              className="text-4xl mb-1"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-text)' }}
            >
              Meetings
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {meetingList.length} meeting{meetingList.length !== 1 ? 's' : ''}{query ? ` for "${query}"` : ''}
            </p>
          </div>

          {/* Search — live as-you-type, debounced 300ms */}
          <SearchInput initialValue={query} />

          {/* Empty states */}
          {hasNoMeetingsAtAll && (
            <div
              className="rounded-sm p-10 text-center flex flex-col items-center gap-3"
              style={{ border: '1px dashed var(--color-border)' }}
            >
              <span className="text-3xl" aria-hidden="true">📋</span>
              <p
                className="text-lg"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                No meetings yet
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Paste a transcript to create your first debrief.
              </p>
              <a
                href="/meetings/new"
                className="mt-2 px-5 py-2 rounded-sm text-sm transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-background)',
                }}
              >
                Create first meeting
              </a>
            </div>
          )}

          {hasNoSearchResults && (
            <div
              className="rounded-sm p-10 text-center flex flex-col items-center gap-3"
              style={{ border: '1px dashed var(--color-border)' }}
            >
              <span className="text-3xl" aria-hidden="true">🔍</span>
              <p
                className="text-lg"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
              >
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Try a different keyword from the meeting title, summary, or transcript.
              </p>
              <a
                href="/meetings"
                className="mt-2 text-sm transition-opacity hover:opacity-60"
                style={{ color: 'var(--color-accent)' }}
              >
                Clear search
              </a>
            </div>
          )}

          {/* Meeting list */}
          {meetingList.length > 0 && (
            <ul className="flex flex-col gap-3">
              {meetingList.map((meeting) => {
                const openCount = openCountByMeeting[meeting.id] ?? 0
                return (
                  <li key={meeting.id}>
                    <a
                      href={`/meetings/${meeting.id}`}
                      className="flex flex-col gap-1 p-5 rounded-sm transition-all hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        textDecoration: 'none',
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <span
                          className="text-base font-medium"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {meeting.title}
                        </span>
                        {openCount > 0 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: 'var(--color-background)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {openCount} open
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
                        >
                          {meeting.date}
                        </span>
                      </div>
                      <p
                        className="text-sm mt-1 line-clamp-2"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {meeting.summary}
                      </p>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
