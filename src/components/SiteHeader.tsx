'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteHeader({ imageUrl, imageAlt, tagline }: { imageUrl: string | null; imageAlt: string; tagline: string }) {
  const pathname = usePathname()
  // Next.jsのLinkは同一ルート内のハッシュ差分だけではスクロールしてくれないため、
  // トップページに既にいる場合だけ自前でスムーススクロールする(他ページからは通常の遷移+ハッシュ移動に任せる)。
  const handleStoresClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return
    e.preventDefault()
    document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <header className="site-header">
      <Link href="/" aria-label={imageAlt}>
        <img src={imageUrl ?? '/images/arch_event.png'} alt={imageAlt} loading="eager" fetchPriority="high" decoding="async" />
      </Link>
      <p className="site-tagline">{tagline}</p>
      <Link href="/#stores" className="more-link" onClick={handleStoresClick}>＞ 所属店舗を見る</Link>
    </header>
  )
}
