'use client'

import Link from 'next/link'
import { useAuth, useConfig } from '@payloadcms/ui'

// ヘッダー右上に常時出すログアウトリンク。標準のログアウトはサイドバー下部にしかなく、
// 画面が狭いとメニューの奥に隠れて気づけないため、別アカウントへ切り替える入口として置く。
export const LogoutLink: React.FC = () => {
  const { user } = useAuth()
  const { config: { routes: { admin } } } = useConfig()
  if (!user) return null

  return (
    <Link href={`${admin}/logout`} className="admin-logout-link" title="ログアウトして別のアカウントでログインし直す">
      ログアウト
    </Link>
  )
}

export default LogoutLink
