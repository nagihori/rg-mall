import { getPayload } from 'payload'
import config from '@payload-config'
import { presentEventCard, type EventCardViewModel } from '@/lib/presenters/event'

export async function getPublicEvents(): Promise<EventCardViewModel[]> {
  const payload = await getPayload({ config }); const results = await payload.find({ collection: 'events', where: { status: { in: ['published', 'archived'] } }, limit: 100, sort: '-publishedAt', depth: 1 })
  return results.docs.map((doc) => presentEventCard({ id: String(doc.id), title: doc.title, slug: doc.slug, summary: doc.summary, body: doc.body, startsAt: doc.startsAt, endsAt: doc.endsAt, publishedAt: doc.publishedAt, status: doc.status as 'published' | 'archived', heroImage: typeof doc.heroImage === 'object' && doc.heroImage?.url ? { url: doc.heroImage.url, alt: doc.heroImage.alt } : null })).filter((event): event is EventCardViewModel => event !== null)
}
export async function getPublicEvent(slug: string) { return (await getPublicEvents()).find((event) => event.href === `/events/${slug}`) ?? null }
