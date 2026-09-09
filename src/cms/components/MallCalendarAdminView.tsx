import { redirect } from 'next/navigation'
import { DefaultTemplate } from '@payloadcms/next/templates'
import type { AdminViewServerProps } from 'payload'
import { AdminMallCalendar } from './AdminMallCalendar'
import { getAdminMallCalendarEntries } from '@/lib/repositories/adminCalendar'
import { buildMallCalendarMonths } from '@/lib/domain/mallCalendar'

// グローバルメニュー「商店街カレンダー」。店舗営業日・商店街イベント・FC内部イベントをまとめて
// 管理画面上で確認できるようにする(公開サイトのトップページと違い、FC内部イベントも含む)。
export default async function MallCalendarAdminView(props: AdminViewServerProps) {
  // 実行時にトップレベルで渡されるのはclientProps+serverPropsのみで、user/permissions/locale/visibleEntitiesは
  // initPageResult経由でしか取れない(型定義上はトップレベルにも存在するように見えるが実際には渡されない)。
  const { payload, i18n, params, searchParams, initPageResult } = props
  const { req, permissions, locale, visibleEntities } = initPageResult
  const user = req.user
  // editor未満(未承認/読み取り専用など)はイベント・店舗を編集できないため、この画面も対象外にする。
  if (!user || !['editor', 'reviewer', 'admin'].includes((user as { role?: string }).role ?? '')) redirect('/admin')
  const entries = await getAdminMallCalendarEntries()
  const months = buildMallCalendarMonths(new Date(), 3)
  return (
    <DefaultTemplate
      i18n={i18n} locale={locale} params={params} payload={payload} permissions={permissions}
      searchParams={searchParams} user={user} visibleEntities={visibleEntities ?? { collections: [], globals: [] }}
    >
      <div className="admin-mall-calendar-view gutter--left gutter--right">
        <h1>商店街カレンダー</h1>
        <p className="admin-mall-calendar-view-lead">店舗営業日・商店街イベント・FC内部イベントをまとめて表示しています。FC内部イベントの詳細はDiscordで運用しています。</p>
        <AdminMallCalendar months={months} entries={entries} />
      </div>
    </DefaultTemplate>
  )
}
