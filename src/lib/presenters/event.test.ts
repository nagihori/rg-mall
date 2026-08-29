import { describe, expect, it } from 'vitest'
import { presentEventCard } from './event'
describe('event presenter', () => { it('presents only public data as a view model', () => { const result = presentEventCard({ id: '1', title: '夏祭り', slug: 'summer', summary: 'ゲーム内で楽しめる夏の限定イベントを開催します。', body: {}, status: 'published', startsAt: '2026-08-30T00:00:00Z', endsAt: '2026-08-31T00:00:00Z' }, new Date('2026-08-29T00:00:00Z')); expect(result).toMatchObject({ href: '/events/summer', category: 'upcoming' }) }) })
