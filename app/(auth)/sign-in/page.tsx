import { Suspense } from 'react'
import SignInButton from './sign-in-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Meeting Debrief',
}

export default function SignInPage() {
  return (
    <main className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
      {/* Left panel — editorial, hidden on mobile */}
      <div
        className="hidden md:flex flex-col justify-between p-12"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div>
          <span
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
          >
            Meeting Debrief
          </span>
        </div>

        <div>
          <h1
            className="text-5xl leading-tight mb-6"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              color: 'var(--color-text)',
            }}
          >
            From transcript
            <br />
            to clarity,{' '}
            <em style={{ color: 'var(--color-accent)' }}>instantly.</em>
          </h1>
          <p
            className="text-base leading-relaxed max-w-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Paste your meeting transcript. Get a structured debrief with
            decisions, action items, and a follow-up email — ready to share.
          </p>
        </div>

        <div
          className="flex gap-6 text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          <span>AI-powered</span>
          <span>·</span>
          <span>GitHub OAuth</span>
          <span>·</span>
          <span>Private by default</span>
        </div>
      </div>

      {/* Right panel — sign in */}
      <div className="flex flex-col items-center justify-center p-8 gap-8">
        {/* Mobile logo */}
        <div className="md:hidden text-center">
          <span
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
          >
            Meeting Debrief
          </span>
          <h1
            className="mt-3 text-3xl leading-tight"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              color: 'var(--color-text)',
            }}
          >
            From transcript to clarity,{' '}
            <em style={{ color: 'var(--color-accent)' }}>instantly.</em>
          </h1>
        </div>

        <div className="text-center w-full max-w-xs">
          <h2
            className="text-2xl mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              color: 'var(--color-text)',
            }}
          >
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to access your meeting debriefs.
          </p>

          <Suspense fallback={<SignInButtonFallback />}>
            <SignInButton />
          </Suspense>

          <p
            className="mt-6 text-xs leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Your transcripts are processed by an AI model. No data is shared
            with third parties.
          </p>
        </div>
      </div>
    </main>
  )
}

function SignInButtonFallback() {
  return (
    <div
      className="h-12 rounded-sm opacity-50"
      style={{ backgroundColor: 'var(--color-surface)' }}
    />
  )
}
