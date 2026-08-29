'use client'

import type { SelectFieldClientProps } from 'payload'
import { Button, useAuth, useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import type { EventStatus } from '@/lib/domain/events'

type Role = 'admin' | 'editor' | 'reviewer'

const statusLabels: Record<EventStatus, string> = { draft: '下書き', in_review: '確認待ち', published: '公開中', archived: 'アーカイブ' }
const pipeline: EventStatus[] = ['draft', 'in_review', 'published', 'archived']

type Action = { key: string; to: EventStatus; label: string; description: string; requiresReview?: boolean; style?: 'primary' | 'secondary' }

// ステータスを変えずに今の内容だけ保存する操作。公開中のときだけ、保存すると確認待ちに戻る
// （このプロジェクトの設計上、公開中の内容を直接書き換えることはできないため）ので、その旨を明記する。
function saveAction(status: EventStatus): Action {
  const description = status === 'published' ? '内容を保存します（確認待ちに戻ります）' : '内容を保存します（ステータスは変わりません）'
  return { key: 'save', to: status, label: '保存する', description, style: 'secondary' }
}

// 「押すと何が起こるか」を役割ごとに言い切る。同じ遷移(例: 確認待ち→下書き)でも、
// 編集者が自分の依頼を取り下げる場合と、確認者が差し戻す場合とでは意味が違うためラベルを分ける。
function actionsFor(status: EventStatus, role: Role): Action[] {
  const canReview = role === 'reviewer' || role === 'admin'
  switch (status) {
    case 'draft':
      return [{ key: 'in_review', to: 'in_review', label: 'レビュー依頼', description: 'この内容を確認者にレビュー依頼します' }]
    case 'in_review':
      return [
        canReview
          ? { key: 'draft', to: 'draft', label: '差し戻す', description: '下書きに戻し、編集者に通知します' }
          : { key: 'draft', to: 'draft', label: '取り下げる', description: '確認依頼を取り下げて下書きに戻します' },
        { key: 'published', to: 'published', label: '公開する', description: 'この内容で公開します', requiresReview: true },
      ]
    case 'published':
      return [
        { key: 'draft', to: 'draft', label: '非公開にする', description: '下書きに戻します（サイトからは見えなくなります）' },
        { key: 'archived', to: 'archived', label: 'アーカイブ', description: '終了したイベントとして扱います（サイトには引き続き表示されます）' },
      ]
    case 'archived':
      return []
  }
}

// イベント編集画面のワークフロー操作。プルダウンだと本来許されない遷移(下書き→公開など)も選べてしまい
// 保存時にエラーになって分かりにくいため、その時点で進める先だけをボタンとして出す。
// サイドバーには全体の流れと現在地の案内だけを表示し、実際の操作ボタンは画面右下に固定表示する
// （幅を問わず同じ位置にすることで、操作に迷わないようにするため）。
export const EventStatusActions: React.FC<SelectFieldClientProps> = ({ path }) => {
  const { value, setValue } = useField<EventStatus>({ path })
  const { value: slug } = useField<string>({ path: 'slug' })
  const { submit } = useForm()
  const { id, collectionSlug } = useDocumentInfo()
  const { user } = useAuth()
  const role = ((user as { role?: Role } | null)?.role ?? 'editor') as Role
  const currentStatus = (value ?? 'draft') as EventStatus
  const transitions = actionsFor(currentStatus, role).filter((action) => !action.requiresReview || role === 'reviewer' || role === 'admin')
  const actions = [saveAction(currentStatus), ...transitions]
  const isPublicNow = currentStatus === 'published' || currentStatus === 'archived'
  const previewUrl = isPublicNow && slug ? `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/events/${slug}` : null

  const handleClick = async (to: EventStatus) => {
    const previous = currentStatus
    setValue(to)
    await submit({ overrides: { status: to } })
    // submit() の戻り値は当てにならない（サーバーが拒否しても検知できない）ため、
    // 保存後に実際のドキュメントを読み直してボタンの見た目を正しい状態に合わせ直す。
    try {
      const res = await fetch(`/api/${collectionSlug}/${id}?depth=0`, { credentials: 'include' })
      const doc = res.ok ? await res.json() : null
      setValue(doc?.status ?? previous)
    } catch {
      setValue(previous)
    }
  }

  return (
    <>
      <div className="event-status-actions__panel">
        <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>公開ワークフロー</div>
        <div className="event-status-actions__pipeline">
          {pipeline.map((step, index) => (
            <span key={step}>
              <span className={`event-status-actions__pipeline-step${step === currentStatus ? ' event-status-actions__pipeline-step--current' : ''}`}>
                {statusLabels[step]}
              </span>
              {index < pipeline.length - 1 && <span style={{ margin: '0 0.25rem', opacity: 0.5 }}>→</span>}
            </span>
          ))}
        </div>
        {previewUrl && (
          <a className="event-status-actions__preview-link" href={previewUrl} target="_blank" rel="noreferrer">
            公開ページを開く ↗
          </a>
        )}
      </div>
      <div className="event-status-actions__bar">
        {actions.map((action) => (
          <Button key={action.key} buttonStyle={action.style ?? 'primary'} size="small" onClick={() => handleClick(action.to)} tooltip={action.description}>
            {action.label}
          </Button>
        ))}
      </div>
    </>
  )
}

export default EventStatusActions
