import Link from 'next/link'
import type { StoreCardViewModel } from '@/lib/presenters/store'

// トップページの控えめな紹介枠用。詳細ページのメイン画像より二回りほど小さい、名前だけのミニカード。
export function StoreMiniCard({ store }: { store: StoreCardViewModel }) {
  return (
    <Link href={store.href} className="store-mini-card">
      {store.image && (
        <div className="store-mini-thumb">
          <img src={store.image.url} alt={store.image.alt} loading="lazy" decoding="async" />
          {store.tagline && <span className="store-mini-tagline">{store.tagline}</span>}
        </div>
      )}
      <p>{store.name}</p>
      <p className="store-mini-owner">{store.owner}</p>
    </Link>
  )
}
