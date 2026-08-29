import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getPublicEvent } from '@/lib/repositories/events'
export const dynamic = 'force-dynamic'
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await getPublicEvent((await params).slug)
  if (!event) notFound()
  return <main className="container"><p className="eyebrow">{event.category}</p><h1>{event.title}</h1><p>{event.period}</p><p>{event.summary}</p>{event.fullImage && <img src={event.fullImage.url} alt={event.fullImage.alt} />}{event.body ? <div className="prose"><RichText data={event.body as SerializedEditorState} /></div> : null}<p><Link href="/" className="back-link">← UPCOMINGイベント一覧へ戻る</Link></p></main>
}
