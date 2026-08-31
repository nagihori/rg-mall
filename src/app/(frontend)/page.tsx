import { EventCard } from '@/components/EventCard'
import { getPublicEvents } from '@/lib/repositories/events'
// CMS側でイベントが変更されるたびに revalidatePublicEventPaths が即時反映するため、
// これは取りこぼし対策のフォールバックとしての秒数。
export const revalidate = 60
export default async function HomePage() { const events = await getPublicEvents(); const groups = { ongoing: events.filter((e) => e.category === 'ongoing'), upcoming: events.filter((e) => e.category === 'upcoming'), new: events.filter((e) => e.category === 'new') }; return <main className="container"><header><h1>ルーガンド商会 商店街</h1><h2>イベントのお知らせ</h2></header>{(['ongoing', 'upcoming', 'new'] as const).map((category) => groups[category].length ? <section key={category}><h2>{{ ongoing: '開催中', upcoming: '開催予定', new: '新着' }[category]}</h2><div className="grid">{groups[category].map((event) => <EventCard key={event.href} event={event} />)}</div></section> : null)}<p><a href="/archive">アーカイブを見る</a></p></main> }
