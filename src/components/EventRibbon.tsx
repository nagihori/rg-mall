import type { EventCategory } from '@/lib/domain/events'

// 「新着」「アーカイブ」はリボンを出すほど緊急性がないため対象外(開催中・開催予定のみ)。
const ribbonLabel: Partial<Record<EventCategory, string>> = { ongoing: '開催中', upcoming: '近日開催' }

export function EventRibbon({ category }: { category: EventCategory }) {
  const label = ribbonLabel[category]
  if (!label) return null
  return <span className="ribbon">{label}</span>
}
