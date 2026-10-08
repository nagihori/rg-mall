'use client'

// サイドメニュー最上部の公開サイトへのリンク。ヘッダー右上のボタン(PublicSiteLink)と同じ役割で、
// ヘッダーが狭い画面でもメニューから辿れるようにする。
export const PublicSiteNavLink: React.FC = () => (
  <a href="/" target="_blank" rel="noreferrer" className="admin-public-site-nav-link" title="公開サイトを新しいタブで開く">
    公開サイトを開く ↗
  </a>
)

export default PublicSiteNavLink
