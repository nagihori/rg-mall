import { revalidatePath } from 'next/cache'

// フッターは全ページ共通(レイアウト側で商店街設定を取得)のため、layoutごとキャッシュを破棄する。
export function revalidatePublicSitePaths() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // no-op: Next.jsのリクエスト文脈外(スクリプト実行など)からの呼び出しは無視する
  }
}
