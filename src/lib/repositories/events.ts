import { getPayload } from 'payload'
import config from '@payload-config'
import { presentEventCard, presentEventDetail, type EventCardViewModel, type EventDetailViewModel, type PublicEvent } from '@/lib/presenters/event'

function toPublicEvent(doc: any): PublicEvent {
  return { id: String(doc.id), title: doc.title, slug: doc.slug, summary: doc.summary, body: doc.body, startsAt: doc.startsAt, endsAt: doc.endsAt, publishedAt: doc.publishedAt, status: doc.status as 'published' | 'archived', heroImage: typeof doc.heroImage === 'object' && doc.heroImage?.url ? { url: doc.heroImage.url, alt: doc.heroImage.alt, thumbnailUrl: doc.heroImage.sizes?.thumbnail?.url ?? null, cardUrl: doc.heroImage.sizes?.card?.url ?? null } : null }
}

export async function getPublicEvents(): Promise<EventCardViewModel[]> {
  const payload = await getPayload({ config }); const results = await payload.find({ collection: 'events', where: { status: { in: ['published', 'archived'] } }, limit: 100, sort: '-publishedAt', depth: 1 })
  return results.docs.map((doc) => presentEventCard(toPublicEvent(doc))).filter((event): event is EventCardViewModel => event !== null)
}
export async function getPublicEvent(slug: string): Promise<EventDetailViewModel | null> {
  const payload = await getPayload({ config }); const results = await payload.find({ collection: 'events', where: { slug: { equals: slug }, status: { in: ['published', 'archived'] } }, limit: 1, depth: 1 })
  const doc = results.docs[0]; return doc ? presentEventDetail(toPublicEvent(doc)) : null
}
