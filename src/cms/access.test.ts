import { describe, expect, it } from 'vitest'
import { canDeleteOwnMedia } from './access'

const as = (role?: string, id: number | null = 7) => canDeleteOwnMedia({ req: { user: role ? { id, role } : null } })

describe('media delete access', () => {
  it('lets admins delete any media', () => { expect(as('admin')).toBe(true) })
  it('limits editors and reviewers to media they uploaded', () => {
    expect(as('editor')).toEqual({ uploadedBy: { equals: 7 } })
    expect(as('reviewer')).toEqual({ uploadedBy: { equals: 7 } })
  })
  it('denies pending users and anonymous requests', () => {
    expect(as('pending')).toBe(false)
    expect(as()).toBe(false)
  })
})
