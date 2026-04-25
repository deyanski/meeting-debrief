'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  initialValue: string
}

export function SearchInput({ initialValue }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync if the server-rendered initial value changes (e.g. navigating back)
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (next.trim()) params.set('q', next.trim())
      router.replace(`/meetings${next.trim() ? `?${params.toString()}` : ''}`)
    }, 300)
  }

  function handleClear() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setValue('')
    router.replace('/meetings')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (timerRef.current) clearTimeout(timerRef.current)
    const params = new URLSearchParams()
    if (value.trim()) params.set('q', value.trim())
    router.replace(`/meetings${value.trim() ? `?${params.toString()}` : ''}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Search meetings…"
        className="flex-1 px-3 py-2 rounded-sm text-sm"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
        }}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-sm text-sm transition-all hover:opacity-80"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
        }}
      >
        Search
      </button>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 rounded-sm text-sm transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Clear
        </button>
      )}
    </form>
  )
}
