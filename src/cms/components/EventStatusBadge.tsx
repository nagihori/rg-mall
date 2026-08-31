'use client'

import { useFormFields } from '@payloadcms/ui'
import { eventStatusLabels, type EventStatus } from '@/lib/domain/events'

// Payload標準の「ステータス: ドラフト/公開済み」表示は、versions.draftsが内部的に持つ
// 公開バージョンの有無(_status)を見ているだけで、このコレクション独自のstatusフィールド
// (下書き/確認待ち/公開中/過去のイベント)とは連動しない。この設計では標準の公開フローを
// 使わないため常に「ドラフト」のままになってしまい、一覧の表示と食い違って混乱を招くため、
// 同じ場所にstatusフィールドの値をそのまま表示するように差し替える。
export const EventStatusBadge: React.FC = () => {
  const status = useFormFields(([fields]) => fields?.status?.value) as EventStatus | undefined
  const label = eventStatusLabels[status ?? 'draft']
  return (
    <div className="status">
      <div className="status__value-wrap">
        <span className="status__label">ステータス: </span>
        <span className="status__value">{label}</span>
      </div>
    </div>
  )
}

export default EventStatusBadge
