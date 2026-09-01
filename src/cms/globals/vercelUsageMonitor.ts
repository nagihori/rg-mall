import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

// Vercel Blobのストレージ使用量監視cron(src/app/api/cron/vercel-usage/route.ts)が、
// 直近でどの閾値までDiscordに通知したかを覚えておくための状態。月が変わったらリセットする。
export const VercelUsageMonitor: GlobalConfig = {
  slug: 'vercelUsageMonitor',
  label: 'Vercel使用量監視',
  access: { read: isAdmin, update: isAdmin },
  fields: [
    { name: 'periodKey', type: 'text', label: '対象月(YYYY-MM)', admin: { readOnly: true } },
    { name: 'notifiedThreshold', type: 'number', label: '通知済みの閾値(%)', defaultValue: 0, admin: { readOnly: true } },
  ],
}
