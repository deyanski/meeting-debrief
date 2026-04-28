export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      {/* Monogram */}
      <div
        style={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 12,
          border: '1px solid var(--color-border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            color: 'var(--color-accent)',
            lineHeight: 1,
          }}
        >
          D
        </span>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
        }}
      >
        Meeting Debrief
      </span>

      {/* Message */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.4rem, 5vw, 1.9rem)',
            color: 'var(--color-text)',
            margin: 0,
            fontWeight: 400,
          }}
        >
          You&rsquo;re offline
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            color: 'var(--color-text-muted)',
            margin: 0,
            maxWidth: 320,
          }}
        >
          Reconnect to the internet to continue using Meeting Debrief.
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 40,
          height: 1,
          backgroundColor: 'var(--color-border)',
        }}
      />

      {/* Retry hint */}
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.05em',
          margin: 0,
        }}
      >
        Check your connection, then refresh the page.
      </p>
    </div>
  )
}
