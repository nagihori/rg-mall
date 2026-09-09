import { toDateKey, type MallCalendarEntry } from '@/lib/domain/mallCalendar'

export type FcEvent = { title: string; date: string; link?: string | null }

// 管理画面カレンダー用。FC内部イベントは詳細をDiscordで運用しているため日付・タイトル・
// 任意のDiscordメッセージリンクのみを持ち、公開サイトのカレンダーには出さない。
export function buildMallCalendarFcEventEntries(events: FcEvent[], now = new Date()): MallCalendarEntry[] {
  const todayKey = toDateKey(now)
  return events
    .filter((event) => Boolean(event.date))
    .map((event) => ({ dateKey: toDateKey(event.date), label: event.title, href: event.link || '', note: null, kind: 'fcEvent' as const, externalUrl: event.link || null }))
    .filter((entry) => entry.dateKey >= todayKey)
}
