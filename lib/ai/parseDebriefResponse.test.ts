import { describe, it, expect } from 'vitest'
import { parseDebriefResponse } from './parseDebriefResponse'

const validDebrief = {
  title: 'Q2 Roadmap Planning',
  date: '2026-04-25',
  summary: 'Team reviewed Q2 priorities and agreed on the roadmap. Key decisions made around feature cuts.',
  decisions: ['Cut feature X from Q2', 'Ship mobile app by June'],
  action_items: [
    { text: 'Write spec for feature Y', owner: 'Alice' },
    { text: 'Set up staging environment', owner: null },
  ],
  blockers: ['Waiting on design sign-off'],
  follow_up_email: 'Hi team, great meeting today...',
}

describe('parseDebriefResponse', () => {
  // ── Happy path ─────────────────────────────────────────────────────────────

  it('parses a valid debrief response', () => {
    const result = parseDebriefResponse(JSON.stringify(validDebrief))
    expect(result).toMatchObject(validDebrief)
  })

  it('parses not_a_meeting error union', () => {
    const result = parseDebriefResponse(JSON.stringify({ error: 'not_a_meeting' }))
    expect(result).toEqual({ error: 'not_a_meeting' })
  })

  it('accepts empty decisions array', () => {
    const result = parseDebriefResponse(
      JSON.stringify({ ...validDebrief, decisions: [] })
    )
    if ('error' in result) throw new Error('Expected debrief, got error')
    expect(result.decisions).toEqual([])
  })

  it('accepts empty action_items array', () => {
    const result = parseDebriefResponse(
      JSON.stringify({ ...validDebrief, action_items: [] })
    )
    if ('error' in result) throw new Error('Expected debrief, got error')
    expect(result.action_items).toEqual([])
  })

  it('accepts empty blockers array', () => {
    const result = parseDebriefResponse(
      JSON.stringify({ ...validDebrief, blockers: [] })
    )
    if ('error' in result) throw new Error('Expected debrief, got error')
    expect(result.blockers).toEqual([])
  })

  it('accepts null owner on action item', () => {
    const input = {
      ...validDebrief,
      action_items: [{ text: 'Do something', owner: null }],
    }
    const result = parseDebriefResponse(JSON.stringify(input))
    if ('error' in result) throw new Error('Expected debrief, got error')
    expect(result.action_items[0].owner).toBeNull()
  })

  it('accepts string owner on action item', () => {
    const input = {
      ...validDebrief,
      action_items: [{ text: 'Write tests', owner: 'Bob' }],
    }
    const result = parseDebriefResponse(JSON.stringify(input))
    if ('error' in result) throw new Error('Expected debrief, got error')
    expect(result.action_items[0].owner).toBe('Bob')
  })

  // ── Failure modes ──────────────────────────────────────────────────────────

  it('throws on malformed JSON', () => {
    expect(() => parseDebriefResponse('not json {')).toThrow('AI response was not valid JSON')
  })

  it('throws on empty string', () => {
    expect(() => parseDebriefResponse('')).toThrow('AI response was not valid JSON')
  })

  it('throws when required field title is missing', () => {
    const { title: _title, ...withoutTitle } = validDebrief
    expect(() => parseDebriefResponse(JSON.stringify(withoutTitle))).toThrow()
  })

  it('throws when required field summary is missing', () => {
    const { summary: _summary, ...withoutSummary } = validDebrief
    expect(() => parseDebriefResponse(JSON.stringify(withoutSummary))).toThrow()
  })

  it('throws when required field date is missing', () => {
    const { date: _date, ...withoutDate } = validDebrief
    expect(() => parseDebriefResponse(JSON.stringify(withoutDate))).toThrow()
  })

  it('throws when action_items is missing', () => {
    const { action_items: _ai, ...withoutItems } = validDebrief
    expect(() => parseDebriefResponse(JSON.stringify(withoutItems))).toThrow()
  })

  it('throws when decisions is not an array', () => {
    const input = { ...validDebrief, decisions: 'make a decision' }
    expect(() => parseDebriefResponse(JSON.stringify(input))).toThrow()
  })

  it('throws when action_item text is empty string', () => {
    const input = {
      ...validDebrief,
      action_items: [{ text: '', owner: null }],
    }
    expect(() => parseDebriefResponse(JSON.stringify(input))).toThrow()
  })

  it('throws on unknown error value (not "not_a_meeting")', () => {
    // Only "not_a_meeting" is a valid error literal — other errors should fail
    expect(() =>
      parseDebriefResponse(JSON.stringify({ error: 'some_other_error' }))
    ).toThrow()
  })

  it('throws when input is null', () => {
    expect(() => parseDebriefResponse('null')).toThrow()
  })

  it('throws when input is a plain array', () => {
    expect(() => parseDebriefResponse('[]')).toThrow()
  })
})
