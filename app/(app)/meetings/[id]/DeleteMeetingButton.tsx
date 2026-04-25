'use client'

import { useState, useTransition } from 'react'
import { deleteMeeting } from './actions'

export function DeleteMeetingButton({ meetingId }: { meetingId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, startTransition] = useTransition()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs tracking-wider uppercase transition-opacity hover:opacity-60"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-destructive)' }}
      >
        Delete meeting
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Are you sure?
      </span>
      <button
        onClick={() => {
          setError(null)
          startTransition(async () => {
            const result = await deleteMeeting(meetingId)
            if (result?.error) {
              setError('Failed to delete. Try again.')
              setConfirming(false)
            }
          })
        }}
        disabled={isDeleting}
        className="text-xs tracking-wider uppercase transition-opacity hover:opacity-60 disabled:opacity-40"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-destructive)' }}
      >
        {isDeleting ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={isDeleting}
        className="text-xs tracking-wider uppercase transition-opacity hover:opacity-60"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
      >
        Cancel
      </button>
      {error && (
        <span className="text-xs" role="alert" style={{ color: 'var(--color-destructive)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
