import { notFound } from 'next/navigation'
import { getPublicEvent } from '@/lib/repositories/events'
export const dynamic = 'force-dynamic'
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) { const event = await getPublicEvent((await params).slug); if (!event) notFound(); return <main className="container"><p className="eyebrow">{event.category}</p><h1>{event.title}</h1><p>{event.period}</p><p>{event.summary}</p>{event.image && <img src={event.image.url} alt={event.image.alt} />}<p>本文は CMS の許可済みリッチテキストとして表示します。</p></main> }
