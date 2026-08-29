import { classifyEvent, type EventCategory, type EventStatus } from '@/lib/domain/events'

export type PublicEvent = { id: string; title: string; slug: string; summary: string; body: unknown; startsAt?: string | null; endsAt?: string | null; publishedAt?: string | null; status: EventStatus; heroImage?: { url: string; alt: string } | null }
export type EventCardViewModel = { title: string; href: string; summary: string; category: EventCategory; period: string; image: { url: string; alt: string } | null }
const fmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' })
export function presentEventCard(event: PublicEvent, now = new Date()): EventCardViewModel | null {
  const category = classifyEvent(event, now); if (!category) return null
  const period = event.startsAt && event.endsAt ? `${fmt.format(new Date(event.startsAt))} 〜 ${fmt.format(new Date(event.endsAt))}` : '期間未定'
  return { title: event.title, href: `/events/${event.slug}`, summary: event.summary, category, period, image: event.heroImage ?? null }
}
