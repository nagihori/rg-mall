import { describe, expect, it } from 'vitest'
import { eventInputSchema, mediaInputSchema } from './event'
const valid = { title: '夏祭り', summary: 'ゲーム内で楽しめる夏の限定イベントを開催します。', body: { root: {} }, startsAt: '2026-08-30T00:00:00Z', endsAt: '2026-08-31T00:00:00Z' }
describe('event validation', () => {
  it('allows a start date with no end date', () => expect(() => eventInputSchema.parse({ ...valid, endsAt: null })).not.toThrow())
  it('rejects an end date with no start date', () => expect(() => eventInputSchema.parse({ ...valid, startsAt: null })).toThrow())
  it('rejects an end before start', () => expect(() => eventInputSchema.parse({ ...valid, endsAt: '2026-08-29T00:00:00Z' })).toThrow())
  it('allows an unset location stored as null', () => expect(() => eventInputSchema.parse({ ...valid, location: null })).not.toThrow())
})
describe('media validation', () => { it('requires image alternative text', () => expect(() => mediaInputSchema.parse({ alt: '', mimeType: 'image/jpeg', size: 1 })).toThrow()); it('allows an empty rights note', () => expect(() => mediaInputSchema.parse({ alt: '祭りの会場', mimeType: 'image/png', size: 1 })).not.toThrow()); it('rejects an oversized image', () => expect(() => mediaInputSchema.parse({ alt: '祭りの会場', rightsNote: '自作', mimeType: 'image/png', size: 10 * 1024 * 1024 + 1 })).toThrow()) })
