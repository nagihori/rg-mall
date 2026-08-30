'use client'

import { useListQuery, useSelection } from '@payloadcms/ui'
import type { Event } from '@/payload-types'

// 一覧の「削除」は下書き状態のイベントにしか効かない(access/beforeOperationで弾かれる)が、
// Payload標準の一覧UIは非対象を黙って除外するだけで「0件のイベントが削除されました」という
// 見た目上は成功に見えるメッセージを出してしまう。ボタン自体を非活性にする拡張ポイントが
// Payload側に無いため、せめて選択時点で気づけるようにここで警告を出す。
export const EventDeleteGuardBanner: React.FC = () => {
  const { selectAll, selected } = useSelection()
  const { data } = useListQuery()
  const docs = (data?.docs ?? []) as Event[]

  const selectedIds = [...selected.entries()].filter(([, isSelected]) => isSelected).map(([id]) => id)
  if (selectedIds.length === 0) return null

  // ページを跨いだ全件選択は今のページのdocsだけでは全容を判定できないため、可能性ベースで注意喚起する
  if (selectAll === 'allAvailable') {
    return (
      <div className="event-delete-guard-banner">
        全件選択には下書き以外のイベントが含まれている可能性があります。削除できるのは下書き状態のイベントのみです。
      </div>
    )
  }

  const nonDraft = docs.filter((doc) => selectedIds.includes(doc.id) && doc.status !== 'draft')
  if (nonDraft.length === 0) return null

  return (
    <div className="event-delete-guard-banner">
      選択した中に下書きではないイベントが含まれているため削除できません（{nonDraft.map((doc) => doc.title).join('、')}）。削除する場合は先に下書きへ戻してください。
    </div>
  )
}

export default EventDeleteGuardBanner
