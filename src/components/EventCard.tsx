import Link from 'next/link'
import type { EventCardViewModel } from '@/lib/presenters/event'
export function EventCard({ event }: { event: EventCardViewModel }) { return <article className="card">{event.image && <Link href={event.href} className="card-thumb"><img src={event.image.url} alt={event.image.alt} /></Link>}<p className="eyebrow">{event.category}</p><h3><Link href={event.href}>{event.title}</Link></h3><p>{event.period}</p><p>{event.summary}</p></article> }
