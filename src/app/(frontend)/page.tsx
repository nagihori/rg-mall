import Link from 'next/link'
import type { Metadata } from 'next'
import { FeaturedHero } from '@/components/FeaturedHero'
import { FeaturedCompact } from '@/components/FeaturedCompact'
import { PastEventCard } from '@/components/PastEventCard'
import { StoreMiniCard } from '@/components/StoreMiniCard'
import { MallScheduleCalendar } from '@/components/MallScheduleCalendar'
import { getMallCalendarEventEntries, getPublicEvents } from '@/lib/repositories/events'
import { getMallCalendarStoreEntries, getPublicStores } from '@/lib/repositories/stores'
import { buildMallCalendarMonths } from '@/lib/domain/mallCalendar'
import { getSiteSettings } from '@/lib/repositories/siteSettings'
import { renderMetaTemplate } from '@/lib/siteMeta'
// CMS側でイベントが変更されるたびに revalidatePublicEventPaths が即時反映するため、
// これは取りこぼし対策のフォールバックとしての秒数。
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const title = renderMetaTemplate(settings.homeTitleTemplate, { site_title: settings.mallName })
  return {
    title: { absolute: title },
    description: settings.siteDescription,
    openGraph: {
      title,
      description: settings.siteDescription,
      images: settings.ogImageUrl
        ? [{ url: settings.ogImageUrl, ...(settings.ogImageWidth && settings.ogImageHeight ? { width: settings.ogImageWidth, height: settings.ogImageHeight } : {}) }]
        : undefined,
    },
  }
}

export default async function HomePage() {
  const [events, stores, storeScheduleEntries, eventCalendarEntries] = await Promise.all([
    getPublicEvents(), getPublicStores(), getMallCalendarStoreEntries(), getMallCalendarEventEntries(),
  ])
  const mallScheduleMonths = buildMallCalendarMonths()
  const mallScheduleEntries = [...eventCalendarEntries, ...storeScheduleEntries]
  // 開催中・開催予定・新着をまとめて「注目のイベント」枠として扱う(2ヶ月に一度もイベントがない想定のため、
  // 単純に開催中/開催予定だけだと枠が空になりやすい)。先頭1件を大きく、続く最大3件を一覧で見せる。
  const live = events.filter((e) => e.category === 'ongoing' || e.category === 'upcoming' || e.category === 'new')
  const [hero, ...restLive] = live
  const compact = restLive.slice(0, 3)
  const past = events.filter((e) => e.category === 'archive').slice(0, 3)

  return (
    <main className="container">
      <h1>イベントのお知らせ</h1>
      {hero ? (
        <section className="featured">
          <FeaturedHero event={hero} />
          {compact.length > 0 && (
            <div className="featured-list">
              {compact.map((event) => <FeaturedCompact key={event.href} event={event} />)}
            </div>
          )}
        </section>
      ) : (
        <p className="empty-note">現在開催中・開催予定のイベントはありません。次のお知らせをお待ちください。</p>
      )}
      {past.length > 0 && (
        <section className="past-section">
          <h2>これまでのイベント</h2>
          <Link href="/archive" className="more-link">＞ もっと前のイベントを見る</Link>
          <div className="grid">
            {past.map((event) => <PastEventCard key={event.href} event={event} />)}
          </div>
        </section>
      )}
      <section id="mall-schedule" className="mall-schedule-section">
        <h2>商店街スケジュール</h2>
        <MallScheduleCalendar months={mallScheduleMonths} entries={mallScheduleEntries} />
      </section>
      {stores.length > 0 && (
        <section id="stores" className="store-preview-section">
          <h2>所属店舗</h2>
          <div className="store-mini-grid">
            {stores.map((store) => <StoreMiniCard key={store.href} store={store} />)}
          </div>
        </section>
      )}
    </main>
  )
}
