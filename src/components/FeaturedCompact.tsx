import Link from 'next/link'
import type { EventCardViewModel } from '@/lib/presenters/event'
import { EventRibbon } from '@/components/EventRibbon'

export function FeaturedCompact({ event }: { event: EventCardViewModel }) {
  return (
    <article className="featured-compact">
      <Link href={event.href} className="featured-compact-thumb">
        {event.image && <img src={event.image.url} alt={event.image.alt} loading="lazy" decoding="async" />}
        <EventRibbon category={event.category} />
      </Link>
      <div>
        {event.shortDate && <span className="date-tag date-tag--inline">{event.shortDate}</span>}
        <h3><Link href={event.href}>{event.title}</Link></h3>
        <p>{event.summary}</p>
      </div>
    </article>
  )
}
