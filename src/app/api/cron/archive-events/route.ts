import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// 開催終了日時(endsAt、未設定ならstartsAt)を過ぎた公開中イベントを毎日自動でアーカイブする(Vercel Cron)。
// 通常の更新と同じ payload.update を通すことで、events.ts の beforeChange/afterChange
// (監査ログ記録・Discord通知)をそのまま利用する。
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const now = new Date()

  const { docs } = await payload.find({
    collection: 'events',
    where: { status: { equals: 'published' } },
    limit: 1000,
    overrideAccess: true,
  })

  const targets = docs.filter((doc) => {
    const effectiveEnd = doc.endsAt ?? doc.startsAt
    return effectiveEnd ? new Date(effectiveEnd) <= now : false
  })

  for (const doc of targets) {
    await payload.update({ collection: 'events', id: doc.id, data: { status: 'archived' }, overrideAccess: true })
  }

  return NextResponse.json({ archived: targets.map((doc) => doc.id) })
}
