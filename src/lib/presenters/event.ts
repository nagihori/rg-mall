import { classifyEvent, type EventCategory, type EventStatus } from '@/lib/domain/events'

type EventImage = { url: string; alt: string; thumbnailUrl?: string | null; cardUrl?: string | null; detailUrl?: string | null }
export type PublicEvent = { id: string; title: string; slug: string; summary: string; body: unknown; location?: string | null; startsAt?: string | null; endsAt?: string | null; publishedAt?: string | null; status: EventStatus; heroImage?: EventImage | null; galleryImages?: EventImage[] }
export type EventCardViewModel = { title: string; href: string; summary: string; category: EventCategory; period: string; shortDate: string | null; image: { url: string; alt: string } | null }
export type GalleryImageViewModel = { url: string; alt: string; zoomUrl: string }
export type EventDetailViewModel = EventCardViewModel & { body: unknown; fullImage: { url: string; alt: string; zoomUrl: string } | null; location: string | null; gallery: GalleryImageViewModel[] }
const dateFmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' })
const timeFmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false })
// トップページのおすすめ枠の日付バッジ用。期間表記(period)より短い「YYYY.MM.DD」だけの表記。
const shortFmt = dateFmt
// 同日開催(1日のうち数時間)が多いため、開始日=終了日のときは終了日を省略して時刻だけにする
function formatPeriod(startsAt?: string | null, endsAt?: string | null): string {
  if (!startsAt) return '期間未定'
  if (!endsAt) return `${dateFmt.format(new Date(startsAt))} ${timeFmt.format(new Date(startsAt))}〜`
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const startDate = dateFmt.format(start)
  const endDate = dateFmt.format(end)
  const startTime = timeFmt.format(start)
  const endTime = timeFmt.format(end)
  return startDate === endDate ? `${startDate} ${startTime}〜${endTime}` : `${startDate} ${startTime} 〜 ${endDate} ${endTime}`
}
function buildCard(event: PublicEvent, category: EventCategory): EventCardViewModel {
  const period = formatPeriod(event.startsAt, event.endsAt)
  const shortDate = event.startsAt ? shortFmt.format(new Date(event.startsAt)).replaceAll('/', '.') : null
  // 一覧・カードはBlobに保存済みのcardサイズ(縮小版)を優先して表示を軽くする
  const image = event.heroImage ? { url: event.heroImage.cardUrl ?? event.heroImage.thumbnailUrl ?? event.heroImage.url, alt: event.heroImage.alt } : null
  return { title: event.title, href: `/events/${event.slug}`, summary: event.summary, category, period, shortDate, image }
}
function buildDetail(event: PublicEvent, card: EventCardViewModel): EventDetailViewModel {
  // 通常表示はdetailサイズ(1280px程度)、拡大用に原本(1600px)のURLも別途持たせる
  const fullImage = event.heroImage ? { url: event.heroImage.detailUrl ?? event.heroImage.cardUrl ?? event.heroImage.url, alt: event.heroImage.alt, zoomUrl: event.heroImage.url } : null
  // ギャラリーの並びはcard(縮小)サムネイルで並べ、クリックで原本を新規タブ表示する
  const gallery = (event.galleryImages ?? []).map((image) => ({ url: image.cardUrl ?? image.thumbnailUrl ?? image.url, alt: image.alt, zoomUrl: image.url }))
  return { ...card, body: event.body, fullImage, location: event.location ?? null, gallery }
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
