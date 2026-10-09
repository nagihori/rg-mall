'use client'

// ヘッダー右上に常時出す公開サイトへのリンク。管理画面から実際の見え方を確認しに行く入口として置く。
// 公開サイトは同一オリジンのルートにあるため相対パスで指す(環境ごとのURL設定に依存しない)。
export const PublicSiteLink: React.FC = () => (
  <a href="/" target="_blank" rel="noreferrer" className="admin-public-site-link" title="公開サイトを新しいタブで開く">
    公開サイトを開く ↗
  </a>
)

export default PublicSiteLink
