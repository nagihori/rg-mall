import Link from 'next/link'
import type { EventCardViewModel } from '@/lib/presenters/event'

export function PastEventCard({ event }: { event: EventCardViewModel }) {
  return (
    <article className="past-card">
      <h3><Link href={event.href}>{event.title}</Link></h3>
      <Link href={event.href} className="past-card-thumb">
        {event.image && <img src={event.image.url} alt={event.image.alt} loading="lazy" decoding="async" />}
      </Link>
      <p>{event.summary}</p>
    </article>
  )
}
