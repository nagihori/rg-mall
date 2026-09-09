import { getMallCalendarStoreEntries } from './stores'
import { getMallCalendarEventEntries } from './events'
import { getFcEventCalendarEntries } from './siteSettings'
import type { MallCalendarEntry } from '@/lib/domain/mallCalendar'

// 管理画面の商店街カレンダー用。公開サイトのトップページと違い、FC内部イベント(Discordで詳細運用)も
// 合わせた全種別を返す(公開サイト側にfcEventは含めない)。
export async function getAdminMallCalendarEntries(): Promise<MallCalendarEntry[]> {
  const [storeEntries, eventEntries, fcEntries] = await Promise.all([
    getMallCalendarStoreEntries(), getMallCalendarEventEntries(), getFcEventCalendarEntries(),
  ])
  return [...storeEntries, ...eventEntries, ...fcEntries]
}
