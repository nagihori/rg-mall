import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAdjacentEvents, getPublicEvent } from '@/lib/repositories/events'
import { EventDetailView } from '@/components/EventDetailView'
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const event = await getPublicEvent((await params).slug)
  if (!event) return {}
  return {
    title: event.title,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary, images: event.fullImage ? [event.fullImage.url] : undefined },
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [event, adjacent] = await Promise.all([getPublicEvent(slug), getAdjacentEvents(slug)])
  if (!event) notFound()
  return <EventDetailView event={event} adjacent={adjacent} />
}
