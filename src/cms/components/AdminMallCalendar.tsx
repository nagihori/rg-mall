import type { MallCalendarEntry, MallCalendarMonth } from '@/lib/domain/mallCalendar'

const weekdayLabels = ['日', '月', '火', '水', '木', '金', '土']
const kindLabels: Record<MallCalendarEntry['kind'], string> = { store: '店舗営業日', event: '商店街イベント', fcEvent: 'FC内部イベント' }

// 管理画面カレンダー(公開サイトのMallScheduleCalendarとは別物)。
// 店舗営業日=白字/商店街イベント=白地帯/FC内部イベント=灰色文字、で種別を判別できるようにする。
export function AdminMallCalendar({ months, entries }: { months: MallCalendarMonth[]; entries: MallCalendarEntry[] }) {
  const entriesByDate = new Map<string, MallCalendarEntry[]>()
  for (const entry of entries) {
    const list = entriesByDate.get(entry.dateKey) ?? []
    list.push(entry)
    entriesByDate.set(entry.dateKey, list)
  }
  return (
    <div className="admin-mall-calendar">
      <ul className="admin-mall-calendar-legend">
        {(Object.keys(kindLabels) as MallCalendarEntry['kind'][]).map((kind) => (
          <li key={kind} className={`is-${kind}`}><span className="admin-mall-calendar-legend-swatch" />{kindLabels[kind]}</li>
        ))}
      </ul>
      {months.map((month) => (
        <div key={month.label} className="admin-mall-calendar-month">
          <h3>{month.label}</h3>
          <div className="admin-mall-calendar-grid">
            {weekdayLabels.map((label) => <div key={label} className="admin-mall-calendar-weekday">{label}</div>)}
            {month.weeks.flat().map((day) => {
              const dayEntries = entriesByDate.get(day.dateKey) ?? []
              return (
                <div key={day.dateKey} className={`admin-mall-calendar-day${day.inMonth ? '' : ' is-outside'}${day.isToday ? ' is-today' : ''}`}>
                  <span className="admin-mall-calendar-day-number">{day.day}</span>
                  {dayEntries.length > 0 && (
                    <ul className="admin-mall-calendar-entries">
                      {dayEntries.map((entry, i) => (
                        <li key={i} className={`is-${entry.kind}`} title={entry.note ?? entry.label}>
                          {entry.externalUrl ? <a href={entry.externalUrl} target="_blank" rel="noreferrer">{entry.label}</a> : <span>{entry.label}</span>}
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
