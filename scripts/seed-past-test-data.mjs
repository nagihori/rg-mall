// トップページの「これまでのイベント」枠を確認するための使い捨てテストデータ投入スクリプト。
// 開発用DB(.env.localのDATABASE_URL=Neon)にのみ書き込む。既存のダミー画像(media id 14-16)を使い回す。
import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'
import { getPayload } from 'payload'
import config from '../payload.config.ts'

const { loadEnvConfig } = nextEnv
loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)))

if (process.env.VERCEL) throw new Error('This seed script must not run on Vercel.')

const payload = await getPayload({ config })
const asAdmin = { user: { collection: 'users', role: 'admin' } }
const heroImageIds = [14, 15, 16]

const pastEvents = [
  { title: '【テスト】過去のイベントその1', summary: '過去イベント表示確認用のテストデータです(60日前開催)。', daysAgo: 60 },
  { title: '【テスト】過去のイベントその2', summary: '過去イベント表示確認用のテストデータです(90日前開催)。', daysAgo: 90 },
  { title: '【テスト】過去のイベントその3', summary: '過去イベント表示確認用のテストデータです(120日前開催)。', daysAgo: 120 },
]

for (const [i, e] of pastEvents.entries()) {
  const start = new Date(Date.now() - e.daysAgo * 24 * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  const event = await payload.create({
    collection: 'events',
    data: {
      title: e.title,
      summary: e.summary,
      heroImage: heroImageIds[i % heroImageIds.length],
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      location: 'ルーガンド商会 商店街',
      status: 'draft',
    },
    ...asAdmin,
  })
  await payload.update({ collection: 'events', id: event.id, data: { status: 'in_review' }, ...asAdmin })
  const published = await payload.update({ collection: 'events', id: event.id, data: { status: 'published' }, ...asAdmin })
  console.log('published past event', published.id, published.slug)
}

process.exit(0)
