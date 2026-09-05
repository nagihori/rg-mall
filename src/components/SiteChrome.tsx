'use client'
import { usePathname } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

// イベント詳細(プレビュー含む)・店舗詳細は「独立したページ」として見せたいので、
// アーチロゴ+FC紹介文のヘッダーだけ外す(戻り導線はページ側で持たせる)。
// フッターは責任範囲/連絡先の表示のため全ページ共通で残す。
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideHeader = pathname?.startsWith('/events/') || pathname?.startsWith('/stores/')
  return (
    <>
      {!hideHeader && <SiteHeader />}
      {children}
      <SiteFooter />
    </>
  )
}
