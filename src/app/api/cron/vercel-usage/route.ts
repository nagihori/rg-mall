import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notifyVercelUsageThreshold } from '../../../../lib/integrations/discord'
import { currentPeriodKey, determineThresholdToNotify, fetchBlobStorageUsage } from '../../../../lib/integrations/vercelUsage'

export const dynamic = 'force-dynamic'

// Vercel Blobのストレージ使用量を毎日チェックし、無料枠の60/70/80/90%を新たに
// 超えたタイミングでDiscordに@here通知する(Vercel Cron)。月が変わったら通知済み
// 閾値をリセットする。
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const apiToken = process.env.VERCEL_PERSONAL_ACCESS_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!apiToken || !teamId) {
    return NextResponse.json({ error: 'VERCEL_PERSONAL_ACCESS_TOKEN or VERCEL_TEAM_ID is not configured' }, { status: 500 })
  }

  const limitGbEnv = process.env.VERCEL_BLOB_STORAGE_LIMIT_GB
  const limitBytes = limitGbEnv ? Number(limitGbEnv) * 1024 * 1024 * 1024 : undefined

  const usage = await fetchBlobStorageUsage({ apiToken, teamId, limitBytes })

  const payload = await getPayload({ config })
  const monitor = await payload.findGlobal({ slug: 'vercelUsageMonitor' })
  const periodKey = currentPeriodKey()
  const lastNotifiedThreshold = monitor.periodKey === periodKey ? (monitor.notifiedThreshold ?? 0) : 0

  const thresholdToNotify = determineThresholdToNotify(usage.percent, lastNotifiedThreshold)

  if (thresholdToNotify !== null) {
    await notifyVercelUsageThreshold({
      resource: 'Vercel Blob Storage',
      percent: usage.percent,
      usedGb: usage.usedBytes / 1024 / 1024 / 1024,
      limitGb: usage.limitBytes / 1024 / 1024 / 1024,
    })
  }

  await payload.updateGlobal({
    slug: 'vercelUsageMonitor',
    data: { periodKey, notifiedThreshold: thresholdToNotify ?? lastNotifiedThreshold },
  })

  return NextResponse.json({ percent: usage.percent, notified: thresholdToNotify })
}
