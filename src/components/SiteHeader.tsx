import Link from 'next/link'
import Image from 'next/image'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" aria-label="ルーガンド商会 商店街 トップへ">
        <Image src="/images/arch_event.png" alt="ルーガンド商会 商店街 イベントのお知らせ" width={1942} height={809} priority sizes="(min-width: 640px) 420px, 80vw" />
      </Link>
      <p className="site-tagline">惑星ハイデリンに生きる住人、冒険者としてRPを楽しみましょうというRPer向けのFC「ルーガンド商会」のイベント紹介ページです。</p>
    </header>
  )
}
