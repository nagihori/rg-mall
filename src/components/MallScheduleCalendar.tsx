import Link from 'next/link'
import type { MallCalendarEntry, MallCalendarMonth } from '@/lib/domain/mallCalendar'

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']

export function MallScheduleCalendar({ months, entries }: { months: MallCalendarMonth[]; entries: MallCalendarEntry[] }) {
  const entriesByDate = new Map<string, MallCalendarEntry[]>()
  for (const entry of entries) {
    const list = entriesByDate.get(entry.dateKey) ?? []
    list.push(entry)
    entriesByDate.set(entry.dateKey, list)
  }
  return (
    <div className="mall-schedule">
      {months.map((month) => (
        <div key={month.label} className="mall-schedule-month">
          <h3>{month.label}</h3>
          <div className="mall-schedule-grid">
            {weekdayLabels.map((label) => <div key={label} className="mall-schedule-weekday">{label}</div>)}
            {month.weeks.flat().map((day) => {
              const dayEntries = entriesByDate.get(day.dateKey) ?? []
              return (
                <div key={day.dateKey} className={`mall-schedule-day${day.inMonth ? '' : ' is-outside'}${day.isToday ? ' is-today' : ''}`}>
                  <span className="mall-schedule-day-number">{day.day}</span>
                  {dayEntries.length > 0 && (
                    // 1件だけなら店名を2行まで、2件以上並ぶ日は合計2行に収まるよう1件1行に切り詰める
                    // (店舗の重複開催は稀に2件程度までの想定のため、3件以上でも1行のまま高さで吸収する)。
                    <ul className={`mall-schedule-entries${dayEntries.length > 1 ? ' is-dense' : ''}`}>
                      {dayEntries.map((entry, i) => (
                        <li key={i} className={`is-${entry.kind}`}>
                          <Link href={entry.href} title={entry.note ?? undefined}>{entry.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
