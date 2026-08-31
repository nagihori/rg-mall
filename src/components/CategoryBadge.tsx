import type { EventCategory } from '@/lib/domain/events'

const labels: Record<EventCategory, string> = { ongoing: '開催中', upcoming: '開催予定', new: '新着', archive: 'アーカイブ' }

export function CategoryBadge({ category, prefix }: { category: EventCategory; prefix?: string }) {
  return <p className={`badge badge-${category}`}>{prefix}{labels[category]}</p>
}
