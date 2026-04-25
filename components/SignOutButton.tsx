'use client'

import { signOut } from '@/app/(app)/actions'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Sign out
      </button>
    </form>
  )
}
