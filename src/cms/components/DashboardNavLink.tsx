'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useConfig } from '@payloadcms/ui'

// サイドメニューからダッシュボードへ戻るためのリンク。標準のメニューにはダッシュボードへの項目がなく、
// パンくずのホームからしか戻れなかったため、コレクション一覧の直前に置く。
// 見た目と現在地の表示は標準のメニュー項目(nav__link / nav__link-indicator)に揃える。
export const DashboardNavLink: React.FC = () => {
  const { config: { routes: { admin } } } = useConfig()
  const pathname = usePathname()
  const active = pathname === admin || pathname === `${admin}/`
  const label = (
    <>
      {active && <div className="nav__link-indicator" />}
      <span className="nav__link-label">ダッシュボード</span>
    </>
  )

  if (active) return <div className="nav__link admin-nav-dashboard" id="nav-dashboard">{label}</div>
  return <Link className="nav__link admin-nav-dashboard" href={admin} id="nav-dashboard" prefetch={false}>{label}</Link>
}

export default DashboardNavLink
