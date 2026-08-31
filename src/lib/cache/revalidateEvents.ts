import { revalidatePath } from 'next/cache'

// 公開サイト側のイベント関連ページのキャッシュを即時破棄する。
// CMS側のevents collectionへの変更(公開/差し戻し/アーカイブ/削除/ゴミ箱移動など)は
// 頻度が低いぶん取りこぼしの方が困るため、変更のたびに一覧・アーカイブ・詳細ページをまとめて破棄する。
export function revalidatePublicEventPaths(slug?: string | null) {
  revalidatePath('/')
  revalidatePath('/archive')
  if (slug) revalidatePath(`/events/${slug}`)
}
