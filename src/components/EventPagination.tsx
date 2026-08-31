import Link from 'next/link'
import type { EventCardViewModel } from '@/lib/presenters/event'

export function EventPagination({ prev, next }: { prev: EventCardViewModel | null; next: EventCardViewModel | null }) {
  if (!prev && !next) return null
  return (
    <nav className="event-pagination" aria-label="前後のイベント">
      {prev ? (
        <Link href={prev.href} className="event-pagination-link event-pagination-prev">
          <span className="event-pagination-label">← 前のイベント</span>
          <span className="event-pagination-title">{prev.title}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.href} className="event-pagination-link event-pagination-next">
          <span className="event-pagination-label">次のイベント →</span>
          <span className="event-pagination-title">{next.title}</span>
        </Link>
      ) : <span />}
    </nav>
  )
}
