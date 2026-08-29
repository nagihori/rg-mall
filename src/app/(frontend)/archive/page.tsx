import { EventCard } from '@/components/EventCard'
import { getPublicEvents } from '@/lib/repositories/events'
export const dynamic = 'force-dynamic'
export default async function ArchivePage() { const events = (await getPublicEvents()).filter((event) => event.category === 'archive'); return <main className="container"><h1>アーカイブ</h1><div className="grid">{events.map((event) => <EventCard key={event.href} event={event} />)}</div></main> }
