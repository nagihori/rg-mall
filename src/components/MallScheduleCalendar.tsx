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
                    <ul className="mall-schedule-entries">
                      {dayEntries.map((entry, i) => (
                        <li key={i} className={entry.kind === 'event' ? 'is-event' : undefined}>
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
