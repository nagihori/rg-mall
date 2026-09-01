import { describe, expect, it } from 'vitest'
import { eventInputSchema } from './event'
const valid = { title: '夏祭り', summary: 'ゲーム内で楽しめる夏の限定イベントを開催します。', body: { root: {} }, startsAt: '2026-08-30T00:00:00Z', endsAt: '2026-08-31T00:00:00Z' }
describe('event validation', () => {
  it('allows a start date with no end date', () => expect(() => eventInputSchema.parse({ ...valid, endsAt: null })).not.toThrow())
  it('rejects an end date with no start date', () => expect(() => eventInputSchema.parse({ ...valid, startsAt: null })).toThrow())
  it('rejects an end before start', () => expect(() => eventInputSchema.parse({ ...valid, endsAt: '2026-08-29T00:00:00Z' })).toThrow())
  it('allows an unset location stored as null', () => expect(() => eventInputSchema.parse({ ...valid, location: null })).not.toThrow())
})
