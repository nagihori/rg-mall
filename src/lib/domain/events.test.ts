import { describe, expect, it } from 'vitest'
import { canTransition, classifyEvent } from './events'
describe('event state transitions', () => {
  it('allows only reviewers to publish', () => {
    expect(canTransition('in_review', 'published', 'editor')).toBe(false)
    expect(canTransition('in_review', 'published', 'reviewer')).toBe(true)
  })
  it('allows a review return', () => { expect(canTransition('in_review', 'draft', 'reviewer')).toBe(true) })
})
describe('event categories', () => {
  const now = new Date('2026-08-29T00:00:00Z')
  it('classifies an active event', () => expect(classifyEvent({ status: 'published', startsAt: '2026-08-28T00:00:00Z', endsAt: '2026-08-30T00:00:00Z' }, now)).toBe('ongoing'))
  it('hides drafts', () => expect(classifyEvent({ status: 'draft' }, now)).toBeNull())
})
