'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
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
      <Link href="/" aria-label="ルーガンド商会 商店街 トップへ">
        <Image src="/images/arch_event.png" alt="ルーガンド商会 商店街 イベントのお知らせ" width={1942} height={809} priority sizes="(min-width: 640px) 420px, 80vw" />
      </Link>
      <p className="site-tagline">惑星ハイデリンに生きる住人、冒険者としてRPを楽しみましょうというRPer向けのFC「ルーガンド商会」のイベント紹介ページです。</p>
      <Link href="/#stores" className="more-link" onClick={handleStoresClick}>＞ 所属店舗を見る</Link>
    </header>
  )
}
