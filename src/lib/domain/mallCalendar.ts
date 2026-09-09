// トップページ「商店街スケジュール」カレンダーの箱組みと、店舗/イベント共通の予定エントリ型。
export type MallCalendarEntry = { dateKey: string; label: string; href: string; note: string | null; kind: 'store' | 'event' }
export type MallCalendarDay = { dateKey: string; day: number; inMonth: boolean; isToday: boolean }
export type MallCalendarMonth = { label: string; weeks: MallCalendarDay[][] }

const monthLabelFmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long' })

// カレンダーの日付キーはタイムゾーンずれで隣の日にならないよう、必ずAsia/Tokyoでの年月日から組み立てる。
export function toDateKey(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  return `${y}-${m}-${day}`
}

// カレンダーの箱組みはAsia/Tokyoの「今日」の年月日だけを起点に、以後はUTC正午のDateで計算する
// (時差もサマータイムも無いのでUTCで組んでも日本時間の日付とずれない。日付境界での時差ずれ事故を避けるため)。
export function buildMallCalendarMonths(now = new Date(), count = 2): MallCalendarMonth[] {
  const todayKey = toDateKey(now)
  const [ty, tm] = todayKey.split('-').map(Number)
  const months: MallCalendarMonth[] = []
  for (let i = 0; i < count; i++) {
    const year = new Date(Date.UTC(ty, tm - 1 + i, 1, 12)).getUTCFullYear()
    const monthIndex = new Date(Date.UTC(ty, tm - 1 + i, 1, 12)).getUTCMonth()
    const startOffset = new Date(Date.UTC(year, monthIndex, 1, 12)).getUTCDay()
    const totalDays = new Date(Date.UTC(year, monthIndex + 1, 0, 12)).getUTCDate()
    const cells: MallCalendarDay[] = []
    for (let d = 1 - startOffset; cells.length < startOffset + totalDays || cells.length % 7 !== 0; d++) {
      const date = new Date(Date.UTC(year, monthIndex, d, 12))
      const dateKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
      cells.push({ dateKey, day: date.getUTCDate(), inMonth: date.getUTCMonth() === monthIndex, isToday: dateKey === todayKey })
    }
    const weeks: MallCalendarDay[][] = []
    for (let w = 0; w < cells.length; w += 7) weeks.push(cells.slice(w, w + 7))
    months.push({ label: monthLabelFmt.format(new Date(Date.UTC(year, monthIndex, 15))), weeks })
  }
  return months
}

// dateKey(YYYY-MM-DD)を1日進める。日をまたぐ複数日イベントの展開に使う。
export function nextDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1, 12))
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`
}
