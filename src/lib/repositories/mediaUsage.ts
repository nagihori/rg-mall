import type { Payload } from 'payload'

// メディアの外部キーは ON DELETE SET NULL のため、使用中の画像を消すと公開中のイベント・店舗・サイト設定から
// 画像だけがエラーなく黙って消える。削除前に参照元を洗い出し、1件でもあれば削除を止めるために使う。
// (Payloadの型付きAPIはメディアIDの型がDB依存で扱いづらいため、検索条件はここに閉じ込める)
export async function findMediaUsages(payload: Payload, mediaId: number | string): Promise<string[]> {
  const usages: string[] = []
  // ゴミ箱の記事も復元されうるため、参照元として数える。
  const [events, stores, settings] = await Promise.all([
    payload.find({
      collection: 'events', depth: 0, limit: 5, trash: true, overrideAccess: true, select: { title: true },
      where: { or: [{ heroImage: { equals: mediaId } }, { galleryImages: { equals: mediaId } }] },
    }),
    payload.find({
      collection: 'stores', depth: 0, limit: 5, trash: true, overrideAccess: true, select: { name: true },
      where: { or: [{ coverImage: { equals: mediaId } }, { mainImage: { equals: mediaId } }, { avatar: { equals: mediaId } }, { galleryImages: { equals: mediaId } }] },
    }),
    payload.findGlobal({ slug: 'siteSettings', depth: 0, overrideAccess: true }),
  ])
  for (const doc of events.docs) usages.push(`イベント「${doc.title}」`)
  for (const doc of stores.docs) usages.push(`所属店舗「${doc.name}」`)
  const used = [settings.headerImage, settings.footerImage, settings.ogImage, settings.favicon].map((value) => (typeof value === 'object' && value ? value.id : value))
  if (used.some((id) => String(id) === String(mediaId))) usages.push('サイト設定(ヘッダー/フッター/OGP画像/ファビコン)')
  return usages
}
