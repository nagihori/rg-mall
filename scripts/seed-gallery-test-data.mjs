// 詳細ページのギャラリー画像出力を確認するための使い捨てテストデータ投入スクリプト。
// 開発用DB(.env.localのDATABASE_URL=Neon)にのみ書き込む。実行後は削除してよい。
import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'
import { getPayload } from 'payload'
import config from '../payload.config.ts'

const { loadEnvConfig } = nextEnv
loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)))

if (process.env.VERCEL) throw new Error('This seed script must not run on Vercel.')

const payload = await getPayload({ config })

const galleryFiles = [
  { path: '/tmp/rgmall-seed/gallery-1.png', alt: '本屋通りの店先(テスト用ダミー画像)' },
  { path: '/tmp/rgmall-seed/gallery-2.png', alt: '商店街のメインストリート(テスト用ダミー画像)' },
  { path: '/tmp/rgmall-seed/gallery-3.png', alt: 'カフェ通りの様子(テスト用ダミー画像)' },
]

const media = []
for (const f of galleryFiles) {
  const doc = await payload.create({ collection: 'media', data: { alt: f.alt, rightsNote: 'テストデータ(hero.pngからの切り出し)' }, filePath: f.path })
  media.push(doc)
  console.log('created media', doc.id, f.alt)
}

// ステータス遷移フックがreq.userのroleを見るため、admin相当のダミーユーザーで実行する。
const asAdmin = { user: { collection: 'users', role: 'admin' } }

const event = await payload.create({
  collection: 'events',
  data: {
    title: '【テスト】ギャラリー表示確認イベント',
    summary: 'ギャラリー画像の表示を確認するためのテストデータです。',
    heroImage: media[0].id,
    galleryImages: media.map((m) => m.id),
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'ルーガンド商会 商店街 本屋通り',
    status: 'draft',
  },
  ...asAdmin,
})
console.log('created draft event', event.id, event.slug)

// draft -> in_review -> published と、許可されている遷移を順番に踏む。
await payload.update({ collection: 'events', id: event.id, data: { status: 'in_review' }, ...asAdmin })
const published = await payload.update({ collection: 'events', id: event.id, data: { status: 'published' }, ...asAdmin })
console.log('published event', published.id, published.slug, published.status)

process.exit(0)
