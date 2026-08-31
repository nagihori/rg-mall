import Link from 'next/link'
import type { EventCardViewModel } from '@/lib/presenters/event'
import { CategoryBadge } from '@/components/CategoryBadge'
export function EventCard({ event }: { event: EventCardViewModel }) { return <article className="card">{event.image && <Link href={event.href} className="card-thumb"><img src={event.image.url} alt={event.image.alt} loading="lazy" decoding="async" /></Link>}<CategoryBadge category={event.category} /><h3><Link href={event.href}>{event.title}</Link></h3><p>{event.period}</p><p>{event.summary}</p></article> }
