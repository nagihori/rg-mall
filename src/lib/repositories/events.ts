import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { presentEventCard, presentEventDetail, presentEventPreview, type EventCardViewModel, type EventDetailViewModel, type PublicEvent } from '@/lib/presenters/event'

function toEventImage(media: any) {
  return typeof media === 'object' && media?.url ? { url: media.url, alt: media.alt, thumbnailUrl: media.sizes?.thumbnail?.url ?? null, cardUrl: media.sizes?.card?.url ?? null, detailUrl: media.sizes?.detail?.url ?? null } : null
}
function toPublicEvent(doc: any): PublicEvent {
  return { id: String(doc.id), title: doc.title, slug: doc.slug, summary: doc.summary, body: doc.body, location: doc.location ?? null, startsAt: doc.startsAt, endsAt: doc.endsAt, publishedAt: doc.publishedAt, status: doc.status as 'published' | 'archived', heroImage: toEventImage(doc.heroImage), galleryImages: (doc.galleryImages ?? []).map(toEventImage).filter((image: ReturnType<typeof toEventImage>) => image !== null) }
}

export async function getPublicEvents(): Promise<EventCardViewModel[]> {
  const payload = await getPayload({ config }); const results = await payload.find({ collection: 'events', where: { status: { in: ['published', 'archived'] } }, limit: 100, sort: '-publishedAt', depth: 1 })
  return results.docs.map((doc) => presentEventCard(toPublicEvent(doc))).filter((event): event is EventCardViewModel => event !== null)
}
// generateMetadataとページ本体の両方から同じslugで呼ばれるため、1リクエスト内では結果をdedupeする
export const getPublicEvent = cache(async (slug: string): Promise<EventDetailViewModel | null> => {
  const payload = await getPayload({ config }); const results = await payload.find({ collection: 'events', where: { slug: { equals: slug }, status: { in: ['published', 'archived'] } }, limit: 1, depth: 1 })
  const doc = results.docs[0]; return doc ? presentEventDetail(toPublicEvent(doc)) : null
})
// 開催日時(startsAt)昇順での前後のイベントを返す(カレンダー的な並びで「前/次のイベント」を示すため)。
export const getAdjacentEvents = cache(async (slug: string): Promise<{ prev: EventCardViewModel | null; next: EventCardViewModel | null }> => {
  const payload = await getPayload({ config })
  const results = await payload.find({ collection: 'events', where: { status: { in: ['published', 'archived'] } }, limit: 500, sort: 'startsAt', depth: 1 })
  const index = results.docs.findIndex((doc) => doc.slug === slug)
  if (index === -1) return { prev: null, next: null }
  const prevDoc = results.docs[index - 1]
  const nextDoc = results.docs[index + 1]
  return { prev: prevDoc ? presentEventCard(toPublicEvent(prevDoc)) : null, next: nextDoc ? presentEventCard(toPublicEvent(nextDoc)) : null }
})
// ステータスを問わず、IDで直接引いて公開ページと同じ見た目を組み立てるプレビュー専用。
// 呼び出し側(プレビューのルート)でログイン中CMSユーザーかどうかを確認してから使うこと。
export async function getPreviewEvent(id: string): Promise<EventDetailViewModel | null> {
  const payload = await getPayload({ config })
  const doc = await payload.findByID({ collection: 'events', id, depth: 1, draft: true }).catch(() => null)
  return doc ? presentEventPreview(toPublicEvent(doc)) : null
}
