'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

type FormState = 'idle' | 'loading' | 'sent' | 'error'

export default function MagicLinkForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setFormState('loading')
    setErrorMsg(null)

    const next = searchParams.get('next')
    const safeNext = next && next.startsWith('/') ? next : '/dashboard'
    const origin = window.location.origin

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    })

    if (error) {
      setFormState('error')
      if (error.message.toLowerCase().includes('rate')) {
        setErrorMsg('Too many attempts. Please wait a moment and try again.')
      } else {
        setErrorMsg('Something went wrong. Please try again.')
      }
      return
    }

    setFormState('sent')
  }

  if (formState === 'sent') {
    return (
      <div className="w-full max-w-xs text-center">
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          Check your inbox
        </p>
        <p
          className="text-xs mt-1 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          A sign-in link was sent to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
          It expires in 1 hour. Check your spam folder if it doesn&apos;t arrive.
        </p>
        <button
          onClick={() => { setFormState('idle'); setEmail('') }}
          className="mt-4 text-xs transition-opacity hover:opacity-60"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Use a different email →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          if (errorMsg) setErrorMsg(null)
          if (formState === 'error') setFormState('idle')
        }}
        placeholder="your@email.com"
        disabled={formState === 'loading'}
        className="w-full px-4 py-3 rounded-sm text-sm focus:outline-none transition-colors"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: `1px solid ${errorMsg ? 'var(--color-destructive)' : 'var(--color-border)'}`,
          color: 'var(--color-text)',
          fontFamily: 'var(--font-mono)',
        }}
      />

      {errorMsg && (
        <p
          className="text-xs"
          role="alert"
          style={{ color: 'var(--color-destructive)' }}
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={formState === 'loading' || !email.trim()}
        className="w-full px-6 py-3 rounded-sm text-sm font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        {formState === 'loading' ? 'Sending…' : 'Continue with Email'}
      </button>
    </form>
  )
}
