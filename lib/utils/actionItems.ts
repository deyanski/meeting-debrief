/**
 * Pure helpers for action item toggle state.
 * These are testable in isolation — no DB calls here.
 */

/**
 * Returns the new completed_at value for an action item toggle.
 * - If currently open (null) → returns current ISO timestamp (marks complete)
 * - If currently complete (string) → returns null (reopens)
 */
export function toggleActionItem(currentCompletedAt: string | null): string | null {
  if (currentCompletedAt === null) {
    return new Date().toISOString()
  }
  return null
}

/**
 * Returns true if the action item is open (not completed).
 */
export function isOpen(completedAt: string | null): boolean {
  return completedAt === null
}
