import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/siteMeta'

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
}

function toImageUrl(media: unknown): string | null {
  return typeof media === 'object' && media !== null && 'url' in media && typeof media.url === 'string' ? media.url : null
}
function toImageAlt(media: unknown): string {
  return typeof media === 'object' && media !== null && 'alt' in media && typeof media.alt === 'string' ? media.alt : ''
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
  }
})
