import Link from 'next/link'
import type { EventCardViewModel } from '@/lib/presenters/event'
import { EventRibbon } from '@/components/EventRibbon'

export function FeaturedHero({ event }: { event: EventCardViewModel }) {
  return (
    <article className="featured-hero">
      <h3><Link href={event.href}>{event.title}</Link></h3>
      <Link href={event.href} className="featured-hero-thumb">
        {event.image && <img src={event.image.url} alt={event.image.alt} loading="eager" fetchPriority="high" decoding="async" />}
        <EventRibbon category={event.category} />
        {event.shortDate && <span className="date-tag">{event.shortDate}</span>}
      </Link>
      <p>{event.summary}</p>
    </article>
  )
}
