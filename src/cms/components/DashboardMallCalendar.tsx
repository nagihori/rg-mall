import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { AdminMallCalendar } from './AdminMallCalendar'
import { getAdminMallCalendarEntries } from '@/lib/repositories/adminCalendar'
import { buildMallCalendarMonths } from '@/lib/domain/mallCalendar'

// ダッシュボード下部(afterDashboard)に出す商店街カレンダー。店舗営業日・商店街イベント・
// FC内部イベントをまとめて表示する(公開サイトと違いFC内部イベントも含む)。
export default async function DashboardMallCalendar({ user }: { user?: AdminViewServerProps['initPageResult']['req']['user'] }) {
  // editor未満(未承認/読み取り専用など)はイベント・店舗を編集できないため、表示対象外にする。
  if (!user || !['editor', 'reviewer', 'admin'].includes((user as { role?: string }).role ?? '')) return null
  const entries = await getAdminMallCalendarEntries()
  const months = buildMallCalendarMonths(new Date(), 3)
  return (
    <section className="admin-mall-calendar-view">
      <div className="admin-mall-calendar-view-header">
        <h2>商店街カレンダー</h2>
        <Link className="admin-mall-calendar-edit-link" href="/admin/globals/siteSettings">FCイベント登録・更新へ</Link>
      </div>
      <p className="admin-mall-calendar-view-lead">FC内部イベントの詳細はDiscordで運用しています。日付とタイトルのみ「商店街設定」の「FCイベント」タブから登録します。</p>
      <AdminMallCalendar months={months} entries={entries} />
    </section>
  )
}
