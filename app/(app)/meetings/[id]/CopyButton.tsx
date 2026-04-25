'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available — silently fail
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs tracking-wider uppercase transition-opacity hover:opacity-60"
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
    >
      {copied ? 'Copied!' : 'Copy email'}
    </button>
  )
}
