import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_HOME_TITLE_TEMPLATE,
  DEFAULT_EVENT_TITLE_TEMPLATE,
  DEFAULT_STORE_TITLE_TEMPLATE,
} from '@/lib/siteMeta'
import { buildMallCalendarFcEventEntries } from '@/lib/presenters/fcEvent'
import type { MallCalendarEntry } from '@/lib/domain/mallCalendar'

export type SiteSettingsViewModel = {
  mallName: string
  server: string | null
  location: string | null
  contactText: string | null
  contactLinkUrl: string | null
  recruitingText: string | null
  recruitingUrl: string | null
  headerImageUrl: string | null
  headerImageAlt: string
  tagline: string
  footerImageUrl: string | null
  footerImageAlt: string
  homeTitleTemplate: string
  eventTitleTemplate: string
  storeTitleTemplate: string
  siteDescription: string
  ogImageUrl: string | null
  ogImageWidth: number | null
  ogImageHeight: number | null
}

function toImageUrl(media: unknown): string | null {
  return typeof media === 'object' && media !== null && 'url' in media && typeof media.url === 'string' ? media.url : null
}
function toImageAlt(media: unknown): string {
  return typeof media === 'object' && media !== null && 'alt' in media && typeof media.alt === 'string' ? media.alt : ''
}
function toImageDim(media: unknown, key: 'width' | 'height'): number | null {
  return typeof media === 'object' && media !== null && key in media && typeof (media as Record<string, unknown>)[key] === 'number'
    ? (media as Record<string, number>)[key]
    : null
}

// レイアウト(ヘッダー/フッター)から1リクエストにつき1回だけ取得できればよいのでdedupeする
export const getSiteSettings = cache(async (): Promise<SiteSettingsViewModel> => {
  const payload = await getPayload({ config })
  const doc = await payload.findGlobal({ slug: 'siteSettings', depth: 1 })
  return {
    mallName: doc.mallName || SITE_NAME,
    server: doc.server ?? null,
    location: doc.location ?? null,
    contactText: doc.contactText ?? null,
    contactLinkUrl: doc.contactLinkEnabled ? (doc.contactLinkUrl ?? null) : null,
    recruitingText: doc.recruitingEnabled ? (doc.recruitingText ?? null) : null,
    recruitingUrl: doc.recruitingEnabled ? (doc.recruitingUrl ?? null) : null,
    headerImageUrl: toImageUrl(doc.headerImage),
    headerImageAlt: toImageAlt(doc.headerImage) || `${doc.mallName || SITE_NAME} トップへ`,
    tagline: doc.tagline || SITE_DESCRIPTION,
    footerImageUrl: toImageUrl(doc.footerImage),
    footerImageAlt: toImageAlt(doc.footerImage),
    homeTitleTemplate: doc.homeTitleTemplate || DEFAULT_HOME_TITLE_TEMPLATE,
    eventTitleTemplate: doc.eventTitleTemplate || DEFAULT_EVENT_TITLE_TEMPLATE,
    storeTitleTemplate: doc.storeTitleTemplate || DEFAULT_STORE_TITLE_TEMPLATE,
    siteDescription: doc.siteDescription || doc.tagline || SITE_DESCRIPTION,
    ogImageUrl: toImageUrl(doc.ogImage) ?? toImageUrl(doc.headerImage),
    ogImageWidth: toImageDim(doc.ogImage, 'width') ?? toImageDim(doc.headerImage, 'width'),
    ogImageHeight: toImageDim(doc.ogImage, 'height') ?? toImageDim(doc.headerImage, 'height'),
  }
})
// 管理画面カレンダー用。FC内部イベント(日付・タイトル・任意の外部リンクのみ)をエントリ化する。
export async function getFcEventCalendarEntries(): Promise<MallCalendarEntry[]> {
  const payload = await getPayload({ config })
  const doc = await payload.findGlobal({ slug: 'siteSettings', depth: 0, select: { fcEvents: true } })
  return buildMallCalendarFcEventEntries((doc.fcEvents ?? []).map((event) => ({ title: event.title, date: event.date, link: event.link ?? null })))
}
