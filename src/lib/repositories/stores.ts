import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { presentStoreCard, presentStoreDetail, type PublicStore, type StoreCardViewModel, type StoreDetailViewModel } from '@/lib/presenters/store'

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
