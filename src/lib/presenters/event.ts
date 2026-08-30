import { classifyEvent, type EventCategory, type EventStatus } from '@/lib/domain/events'

export type PublicEvent = { id: string; title: string; slug: string; summary: string; body: unknown; location?: string | null; startsAt?: string | null; endsAt?: string | null; publishedAt?: string | null; status: EventStatus; heroImage?: { url: string; alt: string; thumbnailUrl?: string | null; cardUrl?: string | null; detailUrl?: string | null } | null }
export type EventCardViewModel = { title: string; href: string; summary: string; category: EventCategory; period: string; image: { url: string; alt: string } | null }
export type EventDetailViewModel = EventCardViewModel & { body: unknown; fullImage: { url: string; alt: string; zoomUrl: string } | null; location: string | null }
const fmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' })
function buildCard(event: PublicEvent, category: EventCategory): EventCardViewModel {
  const period = event.startsAt && event.endsAt ? `${fmt.format(new Date(event.startsAt))} 〜 ${fmt.format(new Date(event.endsAt))}` : '期間未定'
  // 一覧・カードはBlobに保存済みのcardサイズ(縮小版)を優先して表示を軽くする
  const image = event.heroImage ? { url: event.heroImage.cardUrl ?? event.heroImage.thumbnailUrl ?? event.heroImage.url, alt: event.heroImage.alt } : null
  return { title: event.title, href: `/events/${event.slug}`, summary: event.summary, category, period, image }
}
function buildDetail(event: PublicEvent, card: EventCardViewModel): EventDetailViewModel {
  // 通常表示はdetailサイズ(1280px程度)、拡大用に原本(1600px)のURLも別途持たせる
  const fullImage = event.heroImage ? { url: event.heroImage.detailUrl ?? event.heroImage.cardUrl ?? event.heroImage.url, alt: event.heroImage.alt, zoomUrl: event.heroImage.url } : null
  return { ...card, body: event.body, fullImage, location: event.location ?? null }
}
export function presentEventCard(event: PublicEvent, now = new Date()): EventCardViewModel | null {
  const category = classifyEvent(event, now); if (!category) return null
  return buildCard(event, category)
}
export function presentEventDetail(event: PublicEvent, now = new Date()): EventDetailViewModel | null {
  const category = classifyEvent(event, now); if (!category) return null
  return buildDetail(event, buildCard(event, category))
}
// 下書き・確認待ちのプレビュー専用。公開/アーカイブ以外は分類上nullになるが、
// プレビューでは分類できなくても見た目を確認したいだけなので'new'扱いで表示だけ作る。
export function presentEventPreview(event: PublicEvent, now = new Date()): EventDetailViewModel {
  const category = classifyEvent(event, now) ?? 'new'
  return buildDetail(event, buildCard(event, category))
}
