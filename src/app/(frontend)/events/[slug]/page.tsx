import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdjacentEvents, getPublicEvent } from '@/lib/repositories/events'
import { getSiteSettings } from '@/lib/repositories/siteSettings'
import { renderMetaTemplate } from '@/lib/siteMeta'
import { EventDetailView } from '@/components/EventDetailView'
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [event, settings] = await Promise.all([getPublicEvent((await params).slug), getSiteSettings()])
  if (!event) return {}
  const title = renderMetaTemplate(settings.eventTitleTemplate, { event_title: event.title, site_title: settings.mallName })
  return {
    title: { absolute: title },
    description: event.summary,
    openGraph: {
      title,
      description: event.summary,
      images: event.fullImage
        ? [{ url: event.fullImage.url, ...(event.fullImage.width && event.fullImage.height ? { width: event.fullImage.width, height: event.fullImage.height } : {}) }]
        : undefined,
    },
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [event, adjacent] = await Promise.all([getPublicEvent(slug), getAdjacentEvents(slug)])
  if (!event) notFound()
  return <EventDetailView event={event} adjacent={adjacent} />
}
