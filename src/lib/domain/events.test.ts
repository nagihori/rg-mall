import { describe, expect, it } from 'vitest'
import { canTransition, classifyEvent } from './events'
describe('event state transitions', () => {
  it('allows only reviewers to publish', () => {
    expect(canTransition('in_review', 'published', 'editor')).toBe(false)
    expect(canTransition('in_review', 'published', 'reviewer')).toBe(true)
  })
  it('allows a review return', () => { expect(canTransition('in_review', 'draft', 'reviewer')).toBe(true) })
  it('lets an editor unpublish back to draft', () => { expect(canTransition('published', 'draft', 'editor')).toBe(true) })
  it('does not allow skipping review from draft to published', () => { expect(canTransition('draft', 'published', 'admin')).toBe(false) })
  it('lets reviewers and admins return an archived event to draft without republishing', () => {
    expect(canTransition('archived', 'draft', 'reviewer')).toBe(true)
    expect(canTransition('archived', 'draft', 'admin')).toBe(true)
  })
  it('does not let an editor return an archived event to draft', () => { expect(canTransition('archived', 'draft', 'editor')).toBe(false) })
  it('does not allow archiving straight from draft or review', () => {
    expect(canTransition('draft', 'archived', 'admin')).toBe(false)
    expect(canTransition('in_review', 'archived', 'admin')).toBe(false)
  })
})
describe('event categories', () => {
  const now = new Date('2026-08-29T00:00:00Z')
  it('classifies an active event', () => expect(classifyEvent({ status: 'published', startsAt: '2026-08-28T00:00:00Z', endsAt: '2026-08-30T00:00:00Z' }, now)).toBe('ongoing'))
  it('hides drafts', () => expect(classifyEvent({ status: 'draft' }, now)).toBeNull())
})
