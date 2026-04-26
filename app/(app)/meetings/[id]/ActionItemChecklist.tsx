'use client'

import { useEffect, useState, useTransition, useRef } from 'react'
import { updateActionItem, addActionItem } from './actions'

type ActionItem = {
  id: string
  text: string
  owner: string | null
  completed_at: string | null
}

export function ActionItemChecklist({
  items: initialItems,
  meetingId,
}: {
  items: ActionItem[]
  meetingId: string
}) {
  const [items, setItems] = useState(initialItems)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [addText, setAddText] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdding, startAddTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setItems((prev) => {
      const byId = new Map(initialItems.map((item) => [item.id, item]))
      const extras = prev.filter((item) => !byId.has(item.id))
      return [...initialItems, ...extras]
    })
  }, [initialItems])

  async function handleToggle(item: ActionItem) {
    if (pendingId === item.id) return // prevent double-click
    setPendingId(item.id)

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, completed_at: item.completed_at === null ? new Date().toISOString() : null }
          : i
      )
    )

    const result = await updateActionItem(item.id, item.completed_at)

    if (result?.error) {
      // Revert on failure
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? item : i))
      )
    }

    setPendingId(null)
  }

  function handleAdd() {
    const text = addText.trim()
    if (!text) return
    setAddError(null)

    startAddTransition(async () => {
      const result = await addActionItem(meetingId, text)
      if (result && 'error' in result) {
        setAddError('Failed to add item. Try again.')
      } else if (result && 'item' in result) {
        setItems((prev) => {
          if (prev.some((item) => item.id === result.item.id)) return prev
          return [...prev, result.item]
        })
        setAddText('')
        inputRef.current?.focus()
      } else {
        setAddText('')
        inputRef.current?.focus()
      }
    })
  }

  const open = items.filter((i) => i.completed_at === null)
  const done = items.filter((i) => i.completed_at !== null)

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
          No action items recorded.
        </p>
      )}

      {/* Open items */}
      {open.map((item) => (
        <ActionItemRow
          key={item.id}
          item={item}
          isPending={pendingId === item.id}
          onToggle={() => handleToggle(item)}
        />
      ))}

      {/* Completed items */}
      {done.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <p
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            Completed
          </p>
          {done.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              isPending={pendingId === item.id}
              onToggle={() => handleToggle(item)}
            />
          ))}
        </div>
      )}

      {/* Add new item inline */}
      <div className="flex flex-col xs:flex-row gap-2 mt-2">
        <input
          ref={inputRef}
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add action item…"
          disabled={isAdding}
          className="flex-1 px-3 py-2 rounded-sm text-sm"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={isAdding || !addText.trim()}
          className="w-full xs:w-auto px-4 py-2 rounded-sm text-sm transition-all disabled:opacity-40"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-background)',
          }}
        >
          {isAdding ? '…' : 'Add'}
        </button>
      </div>
      {addError && (
        <p className="text-xs" role="alert" style={{ color: 'var(--color-destructive)' }}>
          {addError}
        </p>
      )}
    </div>
  )
}

function ActionItemRow({
  item,
  isPending,
  onToggle,
}: {
  item: ActionItem
  isPending: boolean
  onToggle: () => void
}) {
  const isDone = item.completed_at !== null

  return (
    <div className="flex items-start gap-3 group">
      <button
        onClick={onToggle}
        disabled={isPending}
        aria-label={isDone ? 'Reopen action item' : 'Complete action item'}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center transition-all disabled:opacity-40"
        style={{
          borderColor: isDone ? 'var(--color-accent)' : 'var(--color-border)',
          backgroundColor: isDone ? 'var(--color-accent)' : 'transparent',
        }}
      >
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="var(--color-background)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <span
          className="text-sm leading-relaxed block"
          style={{
            color: isDone ? 'var(--color-text-muted)' : 'var(--color-text)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {item.text}
        </span>
        {item.owner && (
          <span
            className="text-xs mt-0.5 block"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {item.owner}
          </span>
        )}
      </div>
    </div>
  )
}
