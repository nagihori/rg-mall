import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { buildMallCalendarStoreEntries, presentStoreCard, presentStoreDetail, type PublicStore, type StoreCardViewModel, type StoreDetailViewModel } from '@/lib/presenters/store'
import type { MallCalendarEntry } from '@/lib/domain/mallCalendar'

function toStoreImage(media: any) {
  return typeof media === 'object' && media?.url
    ? {
        url: media.url,
        alt: media.alt,
        thumbnailUrl: media.sizes?.thumbnail?.url ?? null,
        cardUrl: media.sizes?.card?.url ?? null,
        detailUrl: media.sizes?.detail?.url ?? null,
      }
    : null
}
function toPublicStore(doc: any): PublicStore {
  return {
    id: String(doc.id), name: doc.name, slug: doc.slug, tagline: doc.tagline ?? null, owner: doc.owner, summary: doc.summary, businessHours: doc.businessHours ?? null, body: doc.body,
    avatar: toStoreImage(doc.avatar), coverImage: toStoreImage(doc.coverImage), mainImage: toStoreImage(doc.mainImage),
    galleryImages: (doc.galleryImages ?? []).map(toStoreImage).filter((image: ReturnType<typeof toStoreImage>) => image !== null),
    ownerLodestoneEnabled: doc.ownerLodestoneEnabled ?? false, ownerLodestoneUrl: doc.ownerLodestoneUrl ?? null,
    snsLinks: doc.snsLinks ?? [],
    scheduleDates: (doc.scheduleDates ?? []).map((entry: any) => ({ date: entry.date, note: entry.note ?? null })),
  }
}

// versions.drafts有効時、draft:trueを渡さないfindは公開版だけを返す(下書き中の変更は公開ページに出ない)。
export async function getPublicStores(): Promise<StoreCardViewModel[]> {
  const payload = await getPayload({ config })
  const results = await payload.find({ collection: 'stores', limit: 100, sort: 'name', depth: 1 })
  return results.docs.map((doc) => presentStoreCard(toPublicStore(doc)))
}
// generateMetadataとページ本体の両方から同じslugで呼ばれるため、1リクエスト内では結果をdedupeする
export const getPublicStore = cache(async (slug: string): Promise<StoreDetailViewModel | null> => {
  const payload = await getPayload({ config })
  const results = await payload.find({ collection: 'stores', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  const doc = results.docs[0]
  return doc ? presentStoreDetail(toPublicStore(doc)) : null
})
// トップページのカレンダー用。画像やSNSリンクなど不要なフィールドは取らず、店舗名・スラッグ・予定日だけに絞る。
export async function getMallCalendarStoreEntries(): Promise<MallCalendarEntry[]> {
  const payload = await getPayload({ config })
  const results = await payload.find({
    collection: 'stores', limit: 100, depth: 0,
    select: { name: true, slug: true, scheduleDates: true },
  })
  return buildMallCalendarStoreEntries(results.docs.map((doc: any) => ({ name: doc.name, slug: doc.slug, scheduleDates: doc.scheduleDates ?? [] })))
}
