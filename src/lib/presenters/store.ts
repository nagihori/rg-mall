type StoreImage = { url: string; alt: string; thumbnailUrl?: string | null; cardUrl?: string | null; detailUrl?: string | null }
type SnsLink = { label?: string | null; url: string }
export type PublicStore = {
  id: string; name: string; slug: string; tagline?: string | null; owner: string; summary: string; businessHours?: string | null; body: unknown
  avatar?: StoreImage | null; coverImage?: StoreImage | null; mainImage?: StoreImage | null; galleryImages?: StoreImage[]
  ownerLodestoneEnabled?: boolean | null; ownerLodestoneUrl?: string | null
  snsLinks?: SnsLink[] | null
}
export type StoreCardViewModel = { name: string; tagline: string | null; href: string; owner: string; summary: string; image: { url: string; alt: string } | null }
export type GalleryImageViewModel = { url: string; alt: string; zoomUrl: string }
export type StoreDetailViewModel = StoreCardViewModel & {
  body: unknown; businessHours: string | null
  avatar: { url: string; alt: string } | null
  cover: { url: string; alt: string } | null
  media: { url: string; alt: string; zoomUrl: string } | null
  gallery: GalleryImageViewModel[]
  ownerLodestoneUrl: string | null
  snsLinks: SnsLink[]
}

function buildCard(store: PublicStore): StoreCardViewModel {
  // 一覧・カードは看板(カバー画像)ではなくメイン画像を使う。未設定の間はカバー画像を代わりに表示する。
  // 表示サイズはBlobに保存済みのcardサイズ(縮小版)を優先して軽くする。
  const imageSource = store.mainImage ?? store.coverImage
  const image = imageSource ? { url: imageSource.cardUrl ?? imageSource.thumbnailUrl ?? imageSource.url, alt: imageSource.alt } : null
  return { name: store.name, tagline: store.tagline ?? null, href: `/stores/${store.slug}`, owner: store.owner, summary: store.summary, image }
}
export function presentStoreCard(store: PublicStore): StoreCardViewModel {
  return buildCard(store)
}
export function presentStoreDetail(store: PublicStore): StoreDetailViewModel {
  const card = buildCard(store)
  // カバー画像(看板)は横長のフルブリード表示、メイン画像は概要文の隣に等身大で表示する別カットという役割分担。
  const cover = store.coverImage ? { url: store.coverImage.detailUrl ?? store.coverImage.cardUrl ?? store.coverImage.url, alt: store.coverImage.alt } : null
  // メイン画像が未設定の間はカバー画像を代わりに表示する(空の枠を出さないためのフォールバック)。
  const mediaSource = store.mainImage ?? store.coverImage
  const media = mediaSource ? { url: mediaSource.detailUrl ?? mediaSource.cardUrl ?? mediaSource.url, alt: mediaSource.alt, zoomUrl: mediaSource.url } : null
  const avatar = store.avatar ? { url: store.avatar.thumbnailUrl ?? store.avatar.cardUrl ?? store.avatar.url, alt: store.avatar.alt } : null
  const gallery = (store.galleryImages ?? []).map((image) => ({ url: image.cardUrl ?? image.thumbnailUrl ?? image.url, alt: image.alt, zoomUrl: image.url }))
  return {
    ...card, body: store.body, businessHours: store.businessHours ?? null, avatar, cover, media, gallery,
    ownerLodestoneUrl: store.ownerLodestoneEnabled ? (store.ownerLodestoneUrl ?? null) : null,
    snsLinks: (store.snsLinks ?? []).filter((link) => Boolean(link.url)),
  }
}
