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

// 日付の古い順に並べる(管理画面の一覧用)。同日はタイトル順で安定させる。
export function sortFcEventsByDate<T extends { date: string; title: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => toDateKey(a.date).localeCompare(toDateKey(b.date)) || a.title.localeCompare(b.title, 'ja'))
}

// 開催日(JST)が今日より前のFCイベントを「終了済み」として振り分ける。当日分はまだ残す。
export function partitionFcEventsByEnded<T extends { date: string }>(events: T[], now = new Date()): { active: T[]; ended: T[] } {
  const todayKey = toDateKey(now)
  const active: T[] = []
  const ended: T[] = []
  for (const event of events) (toDateKey(event.date) < todayKey ? ended : active).push(event)
  return { active, ended }
}
