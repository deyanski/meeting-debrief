import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — Meeting Debrief',
}

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
        }}
      >
        Dashboard
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 400,
          color: 'var(--color-text)',
        }}
      >
        You&apos;re signed in.
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Dashboard coming in Phase 2.
      </p>
    </main>
  )
}
