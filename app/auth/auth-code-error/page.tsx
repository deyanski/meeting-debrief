import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign-in Error — Meeting Debrief',
}

export default function AuthCodeErrorPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1.5rem',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-destructive)',
        }}
      >
        Auth error
      </span>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 400,
          color: 'var(--color-text)',
        }}
      >
        Sign-in failed
      </h1>

      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          maxWidth: '40ch',
        }}
      >
        The sign-in link was invalid or has expired. Magic link emails expire
        after 1 hour. Please try signing in again.
      </p>

      <a
        href="/sign-in"
        style={{
          marginTop: '0.5rem',
          padding: '0.75rem 1.75rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.125rem',
          color: 'var(--color-text)',
          fontSize: '0.875rem',
          textDecoration: 'none',
          fontFamily: 'var(--font-sans)',
          transition: 'border-color 0.15s',
        }}
      >
        Back to sign in
      </a>
    </main>
  )
}
