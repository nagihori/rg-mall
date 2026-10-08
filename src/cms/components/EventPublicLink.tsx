'use client'

import type { UIFieldClientProps } from 'payload'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import type { EventStatus } from '@/lib/domain/events'

// 公開中/過去のイベントは公開URLそのもの、下書き・確認待ちはステータスを無視して読めるプレビュー専用ルートを指す。
// まだ一度も保存していない(id未確定の)新規作成中はどちらも参照できないため何も出さない。
export const EventPublicLink: React.FC<UIFieldClientProps> = () => {
  const { id } = useDocumentInfo()
  const { value: status } = useField<EventStatus>({ path: 'status' })
  const { value: slug } = useField<string>({ path: 'slug' })
  if (!id) return null
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const isPublicNow = status === 'published' || status === 'archived'
  const href = isPublicNow && slug ? `${appUrl}/events/${slug}` : `${appUrl}/events/preview/${id}`

  return (
    <a className="event-public-link" href={href} target="_blank" rel="noreferrer">
      {isPublicNow ? '公開ページを開く ↗' : 'プレビューを開く ↗'}
    </a>
  )
}

export default EventPublicLink
