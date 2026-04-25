import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toggleActionItem, isOpen } from './actionItems'

describe('toggleActionItem', () => {
  const FIXED_DATE = '2026-04-25T10:00:00.000Z'

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FIXED_DATE))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('marks an open item complete — returns ISO timestamp', () => {
    const result = toggleActionItem(null)
    expect(result).toBe(FIXED_DATE)
  })

  it('reopens a completed item — returns null', () => {
    const result = toggleActionItem('2026-04-24T09:00:00.000Z')
    expect(result).toBeNull()
  })

  it('returned timestamp is a valid ISO 8601 string', () => {
    const result = toggleActionItem(null)
    expect(result).not.toBeNull()
    expect(new Date(result!).toISOString()).toBe(result)
  })

  it('idempotent open→complete: two calls from null both return the current time', () => {
    const first = toggleActionItem(null)
    const second = toggleActionItem(null)
    expect(first).toBe(second)
  })

  it('idempotent complete→open: two calls from a timestamp both return null', () => {
    const timestamp = '2026-04-24T09:00:00.000Z'
    const first = toggleActionItem(timestamp)
    const second = toggleActionItem(timestamp)
    expect(first).toBeNull()
    expect(second).toBeNull()
  })

  it('round-trip: open → complete → reopen returns null', () => {
    const completed = toggleActionItem(null)
    const reopened = toggleActionItem(completed)
    expect(reopened).toBeNull()
  })
})

describe('isOpen', () => {
  it('returns true when completed_at is null', () => {
    expect(isOpen(null)).toBe(true)
  })

  it('returns false when completed_at is a timestamp', () => {
    expect(isOpen('2026-04-25T10:00:00.000Z')).toBe(false)
  })
})
