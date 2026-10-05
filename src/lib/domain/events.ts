export const eventStatuses = ['draft', 'in_review', 'published', 'archived'] as const
export type EventStatus = (typeof eventStatuses)[number]
export type EventCategory = 'ongoing' | 'upcoming' | 'new' | 'archive'

// 管理画面の一覧・編集画面・ステータスバッジなど表示箇所ごとに個別定義すると
// 文言がずれるため、ここに一本化する。
export const eventStatusLabels: Record<EventStatus, string> = { draft: '下書き', in_review: '確認待ち', published: 'トップページに表示中', archived: '過去のイベント' }

const transitions: Record<EventStatus, readonly EventStatus[]> = {
  draft: ['in_review'], in_review: ['draft', 'published'], published: ['draft', 'archived'], archived: ['published', 'draft'],
}
export function canTransition(from: EventStatus, to: EventStatus, role: 'editor' | 'reviewer' | 'admin') {
  if (!transitions[from].includes(to)) return false
  if (to === 'published' && role === 'editor') return false
  // 過去のイベント→下書きは、公開済みの記事をサイトから外す操作なので確認者/管理者のみ(公開と同じ扱い)。
  if (from === 'archived' && to === 'draft' && role === 'editor') return false
  return true
}
export function assertTransition(from: EventStatus, to: EventStatus, role: 'editor' | 'reviewer' | 'admin') {
  if (!canTransition(from, to, role)) throw new Error(`Invalid event transition: ${from} -> ${to}`)
}
export function isPublic(status: EventStatus) { return status === 'published' || status === 'archived' }
export function classifyEvent(input: { status: EventStatus; startsAt?: string | null; endsAt?: string | null; publishedAt?: string | null }, now = new Date()): EventCategory | null {
  if (!isPublic(input.status)) return null
  const start = input.startsAt ? new Date(input.startsAt) : null
  const end = input.endsAt ? new Date(input.endsAt) : null
  if (start && end && start <= now && now < end) return 'ongoing'
  if (start && now < start) return 'upcoming'
  if (end && end <= now) return 'archive'
  const published = input.publishedAt ? new Date(input.publishedAt) : null
  return published && now.getTime() - published.getTime() >= 30 * 86400000 ? 'archive' : 'new'
}
