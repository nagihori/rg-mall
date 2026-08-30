import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getPreviewEvent } from '@/lib/repositories/events'
export const dynamic = 'force-dynamic'
// 公開ページと同じ見た目で、ステータス(下書き・確認待ちも含む)を問わず内容を確認できるプレビュー。
// ログイン中のCMSユーザー(editor以上)だけが開けるようにする。
export default async function EventPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) redirect('/admin/login')
  const event = await getPreviewEvent(id)
  if (!event) notFound()
  return <main className="container"><p className="eyebrow">プレビュー（{event.category}）</p><h1>{event.title}</h1><p>{event.period}</p>{event.location && <p>会場: {event.location}</p>}<p>{event.summary}</p>{event.fullImage && <a href={event.fullImage.zoomUrl} target="_blank" rel="noreferrer"><img src={event.fullImage.url} alt={event.fullImage.alt} /></a>}{event.body ? <div className="prose"><RichText data={event.body as SerializedEditorState} /></div> : null}</main>
}
