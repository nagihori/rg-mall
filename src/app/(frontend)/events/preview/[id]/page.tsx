import { notFound, redirect } from 'next/navigation'
import { headers as getHeaders } from 'next/headers'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPreviewEvent } from '@/lib/repositories/events'
import { EventDetailView } from '@/components/EventDetailView'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'プレビュー', robots: { index: false, follow: false } }
// 公開ページと同じ見た目で、ステータス(下書き・確認待ちも含む)を問わず内容を確認できるプレビュー。
// ログイン中のCMSユーザー(editor以上)だけが開けるようにする。
export default async function EventPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })
  if (!user) redirect('/admin/login')
  const event = await getPreviewEvent(id)
  if (!event) notFound()
  return <EventDetailView event={event} previewLabel="プレビュー" />
}
