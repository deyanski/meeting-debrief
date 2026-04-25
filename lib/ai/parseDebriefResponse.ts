import { DebriefResponseSchema, type DebriefResponse } from './schema'

/**
 * Parses a raw string from the AI into a validated DebriefResponse.
 * Throws on malformed JSON or schema violations — callers must catch.
 */
export function parseDebriefResponse(raw: string): DebriefResponse {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('AI response was not valid JSON')
  }

  // Will throw ZodError if schema doesn't match
  return DebriefResponseSchema.parse(parsed)
}
