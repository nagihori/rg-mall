import { revalidatePath } from 'next/cache'

// 公開サイト側の店舗関連ページのキャッシュを即時破棄する。revalidateEvents.tsと同じ理由で
// スクリプト実行などNextのリクエスト文脈外からの呼び出しはベストエフォートとして握りつぶす。
export function revalidatePublicStorePaths(slug?: string | null) {
  try {
    // 店舗一覧はトップページの所属店舗セクションが兼ねているため、専用の一覧ページは持たない。
    revalidatePath('/')
    if (slug) revalidatePath(`/stores/${slug}`)
  } catch {
    // no-op: Next.jsのリクエスト文脈外(スクリプト実行など)からの呼び出しは無視する
  }
}
