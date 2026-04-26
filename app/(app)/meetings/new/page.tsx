'use client'

import { useState, useTransition, useRef } from 'react'
import { saveMeeting } from '../actions'
import type { Debrief } from '@/lib/ai/schema'
import { SignOutButton } from '@/components/SignOutButton'
import { ThemeToggle } from '@/components/ThemeToggle'

type DraftState = Debrief & { raw_transcript: string }

const MIN_TRANSCRIPT_LENGTH = 50

export default function NewMeetingPage() {
  const [transcript, setTranscript] = useState('')
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [loadingDebrief, setLoadingDebrief] = useState(false)
  const [debriefError, setDebriefError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, startSaveTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleClear() {
    setTranscript('')
    setDebriefError(null)
    textareaRef.current?.focus()
  }

  async function handleDebrief() {
    if (transcript.trim().length < MIN_TRANSCRIPT_LENGTH) {
      setDebriefError('Transcript must be at least 50 characters.')
      return
    }

    setLoadingDebrief(true)
    setDebriefError(null)
    setDraft(null)

    try {
      const res = await fetch('/api/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })

      const data: unknown = await res.json()

      if (!res.ok) {
        setDebriefError('Something went wrong. Please try again.')
        return
      }

      // Check for not_a_meeting signal
      if (
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        (data as { error: unknown }).error === 'not_a_meeting'
      ) {
        setDebriefError(
          "This doesn't look like a meeting transcript. Please paste the actual meeting transcript and try again."
        )
        return
      }

      if (
        typeof data === 'object' &&
        data !== null &&
        'error' in data
      ) {
        setDebriefError('Something went wrong processing the transcript. Please try again.')
        return
      }

      setDraft({ ...(data as Debrief), raw_transcript: transcript })
    } catch {
      // Network error — textarea stays populated per spec
      setDebriefError('Network error. Please check your connection and try again.')
    } finally {
      setLoadingDebrief(false)
    }
  }

  function handleSave() {
    if (!draft) return
    setSaveError(null)

    startSaveTransition(async () => {
      const result = await saveMeeting(draft)
      // saveMeeting redirects on success; only returns on error
      if (result?.error) {
        setSaveError(
          result.error === 'unauthorized'
            ? 'Your session has expired. Please sign in again.'
            : 'Failed to save. Please try again.'
        )
      }
    })
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
        style={{
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <a
            href="/meetings"
            className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60 shrink-0"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
          >
            ← Meetings
          </a>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span
            className="text-xs tracking-widest uppercase truncate"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
          >
            New Debrief
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        {!draft ? (
          // ── Transcript input phase ──────────────────────────────────────
          <div className="flex flex-col gap-6">
            <div>
              <h1
                className="text-4xl mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  color: 'var(--color-text)',
                }}
              >
                Paste your transcript
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Paste the full meeting transcript below. The AI will extract decisions,
                action items, blockers, and draft a follow-up email.
              </p>
            </div>

            <textarea
              ref={textareaRef}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value)
                if (debriefError) setDebriefError(null)
              }}
              placeholder="[00:00] Alice: Let's start with the Q2 roadmap..."
              rows={14}
              className="w-full resize-y rounded-sm p-4 text-sm leading-relaxed focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: `1px solid ${debriefError ? 'var(--color-destructive)' : 'var(--color-border)'}`,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-mono)',
              }}
              disabled={loadingDebrief}
            />

            {debriefError && (
              <p
                className="text-sm"
                role="alert"
                style={{ color: 'var(--color-destructive)' }}
              >
                {debriefError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleDebrief}
                disabled={loadingDebrief || transcript.trim().length < MIN_TRANSCRIPT_LENGTH}
                className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-background)',
                }}
              >
                {loadingDebrief ? (
                  <>
                    <LoadingSpinner />
                    Analysing transcript…
                  </>
                ) : (
                  'Generate Debrief'
                )}
              </button>

              {transcript.length > 0 && !loadingDebrief && (
                <button
                  onClick={handleClear}
                  className="px-4 py-3 rounded-sm text-sm tracking-wide transition-opacity hover:opacity-60"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ) : (
          // ── Editable draft phase ────────────────────────────────────────
          <DraftEditor
            draft={draft}
            onChange={setDraft}
            onSave={handleSave}
            isSaving={isSaving}
            saveError={saveError}
            onBack={() => {
              setDraft(null)
              setSaveError(null)
            }}
          />
        )}
      </main>
    </div>
  )
}

// ── Draft editor component ───────────────────────────────────────────────────

function DraftEditor({
  draft,
  onChange,
  onSave,
  isSaving,
  saveError,
  onBack,
}: {
  draft: DraftState
  onChange: (d: DraftState) => void
  onSave: () => void
  isSaving: boolean
  saveError: string | null
  onBack: () => void
}) {
  function updateField<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    onChange({ ...draft, [key]: value })
  }

  function updateActionItemText(index: number, text: string) {
    const updated = draft.action_items.map((item, i) =>
      i === index ? { ...item, text } : item
    )
    updateField('action_items', updated)
  }

  function updateActionItemOwner(index: number, owner: string) {
    const updated = draft.action_items.map((item, i) =>
      i === index ? { ...item, owner: owner.trim() || null } : item
    )
    updateField('action_items', updated)
  }

  function removeActionItem(index: number) {
    updateField('action_items', draft.action_items.filter((_, i) => i !== index))
  }

  function addActionItem() {
    updateField('action_items', [...draft.action_items, { text: '', owner: null }])
  }

  function updateStringArray(key: 'decisions' | 'blockers', index: number, value: string) {
    const updated = (draft[key] as string[]).map((item, i) => (i === index ? value : item))
    updateField(key, updated)
  }

  function removeFromArray(key: 'decisions' | 'blockers', index: number) {
    updateField(key, (draft[key] as string[]).filter((_, i) => i !== index))
  }

  function addToArray(key: 'decisions' | 'blockers') {
    updateField(key, [...(draft[key] as string[]), ''])
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl mb-1"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--color-text)' }}
          >
            Review your debrief
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Edit any field before saving.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs tracking-wider uppercase transition-opacity hover:opacity-60"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          ← Edit transcript
        </button>
      </div>

      {/* Title + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-1">
          <FieldLabel>Title</FieldLabel>
          <input
            value={draft.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full px-3 py-2 rounded-sm text-sm"
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <FieldLabel>Date</FieldLabel>
          <input
            value={draft.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="w-full px-3 py-2 rounded-sm text-sm"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-1">
        <FieldLabel>Summary</FieldLabel>
        <textarea
          value={draft.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-sm text-sm resize-y"
          style={inputStyle}
        />
      </div>

      {/* Action Items */}
      <div className="flex flex-col gap-2">
        <FieldLabel>Action Items</FieldLabel>
        {draft.action_items.length === 0 && (
          <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
            No action items — add one below.
          </p>
        )}
        {draft.action_items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                value={item.text}
                onChange={(e) => updateActionItemText(i, e.target.value)}
                placeholder="What needs to be done"
                className="flex-1 px-3 py-2 rounded-sm text-sm"
                style={inputStyle}
              />
              <input
                value={item.owner ?? ''}
                onChange={(e) => updateActionItemOwner(i, e.target.value)}
                placeholder="Owner (optional)"
                className="w-full sm:w-40 px-3 py-2 rounded-sm text-sm"
                style={inputStyle}
              />
            </div>
            <button
              onClick={() => removeActionItem(i)}
              className="mt-2 text-xs transition-opacity hover:opacity-60"
              style={{ color: 'var(--color-destructive)' }}
              aria-label="Remove action item"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addActionItem}
          className="self-start text-xs tracking-wider uppercase mt-1 transition-opacity hover:opacity-60"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
        >
          + Add item
        </button>
      </div>

      {/* Decisions */}
      <StringListEditor
        label="Decisions"
        items={draft.decisions}
        onUpdate={(i, v) => updateStringArray('decisions', i, v)}
        onRemove={(i) => removeFromArray('decisions', i)}
        onAdd={() => addToArray('decisions')}
        emptyText="No decisions recorded."
        addLabel="+ Add decision"
      />

      {/* Blockers */}
      <StringListEditor
        label="Blockers"
        items={draft.blockers}
        onUpdate={(i, v) => updateStringArray('blockers', i, v)}
        onRemove={(i) => removeFromArray('blockers', i)}
        onAdd={() => addToArray('blockers')}
        emptyText="No blockers — great!"
        addLabel="+ Add blocker"
      />

      {/* Follow-up email */}
      <div className="flex flex-col gap-1">
        <FieldLabel>Follow-up Email</FieldLabel>
        <textarea
          value={draft.follow_up_email}
          onChange={(e) => updateField('follow_up_email', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 rounded-sm text-sm resize-y"
          style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
        />
      </div>

      {saveError && (
        <p className="text-sm" role="alert" style={{ color: 'var(--color-destructive)' }}>
          {saveError}
        </p>
      )}

      {/* Save button — disabled during in-flight to prevent double-submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={onSave}
          disabled={isSaving || !draft.title.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-medium tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-background)',
          }}
        >
          {isSaving ? (
            <>
              <LoadingSpinner />
              Saving…
            </>
          ) : (
            'Save Debrief'
          )}
        </button>
      </div>
    </div>
  )
}

// ── Shared helpers ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-xs tracking-widest uppercase"
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
    >
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
}

function StringListEditor({
  label,
  items,
  onUpdate,
  onRemove,
  onAdd,
  emptyText,
  addLabel,
}: {
  label: string
  items: string[]
  onUpdate: (index: number, value: string) => void
  onRemove: (index: number) => void
  onAdd: () => void
  emptyText: string
  addLabel: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      {items.length === 0 && (
        <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
          {emptyText}
        </p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            onChange={(e) => onUpdate(i, e.target.value)}
            className="flex-1 px-3 py-2 rounded-sm text-sm"
            style={inputStyle}
          />
          <button
            onClick={() => onRemove(i)}
            className="text-xs transition-opacity hover:opacity-60"
            style={{ color: 'var(--color-destructive)' }}
            aria-label={`Remove ${label.toLowerCase()} item`}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="self-start text-xs tracking-wider uppercase mt-1 transition-opacity hover:opacity-60"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
      >
        {addLabel}
      </button>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
