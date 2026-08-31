'use client'

import type { SelectFieldClientProps } from 'payload'
import { useEffect } from 'react'
import { Button, ConfirmationModal, useAuth, useDocumentInfo, useField, useForm, useModal } from '@payloadcms/ui'
import type { EventStatus } from '@/lib/domain/events'

type Role = 'admin' | 'editor' | 'reviewer'

const statusLabels: Record<EventStatus, string> = { draft: '下書き', in_review: '確認待ち', published: 'トップページに表示中', archived: '過去のイベント' }
const pipeline: EventStatus[] = ['draft', 'in_review', 'published', 'archived']
const editConfirmModalSlug = 'event-status-edit-confirm'

type Action = { key: string; to: EventStatus; label: string; description: string; requiresReview?: boolean; requiresConfirm?: boolean; style?: 'primary' | 'secondary' }

// ステータスを変えずに下書きの内容だけ保存する操作。下書き以外は本文が編集できない
// (公開中はreadOnly)か、他の遷移ボタンが実質保存を兼ねるため、下書きのときだけ出す。
function saveAction(): Action {
  return { key: 'save', to: 'draft', label: '保存する', description: '内容を保存します（ステータスは変わりません）', style: 'secondary' }
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
        { key: 'published', to: 'published', label: 'トップページに表示する', description: 'この内容でトップページに表示します', requiresReview: true },
      ]
    case 'published':
      return [
        // 表示中の内容は直接編集できない設計のため、「編集する」＝一旦下書きに戻す、という意味を持つ。
        // 押した瞬間サイトから見えなくなる（押し間違えると即非表示）ので、これだけ確認を挟む。
        { key: 'draft', to: 'draft', label: '編集する', description: '下書きに戻して編集できるようにします（サイトからは見えなくなります）', requiresConfirm: true },
        { key: 'archived', to: 'archived', label: '過去のイベントに移動する', description: '終了したイベントとして扱います（サイトには引き続き表示されます）', style: 'secondary' },
      ]
    case 'archived':
      // 内容は変わらないまま表示場所を戻すだけなので、公開と同じ「確認者/管理者のみ」の扱いにする。
      return [{ key: 'published', to: 'published', label: 'トップページに表示する', description: '過去のイベントからトップページ表示に戻します', requiresReview: true }]
  }
}

// 確認待ちの間、編集者と確認者/管理者とで「今何を待っているか」が違うため、状況説明の文言を分ける。
function statusMessage(status: EventStatus, canReview: boolean): string | null {
  if (status !== 'in_review') return null
  return canReview ? '承認依頼が届いています。対応を決めてください' : '現在確認中です。承認が降りると公開されて通知が届きます'
}

// 削除は下書き状態のイベントのみ可能（管理者も例外なし）。一覧・編集画面どちらでも消せない状態があるため、
// 「なぜ消せないか」を編集画面側で先に案内しておく。
function deleteNote(status: EventStatus): string | null {
  if (status === 'draft') return null
  return '削除できるのは下書き状態のイベントのみです。削除したい場合は先に「編集する」等で下書きに戻してください'
}

// イベント編集画面のワークフロー操作。プルダウンだと本来許されない遷移(下書き→公開など)も選べてしまい
// 保存時にエラーになって分かりにくいため、その時点で進める先だけをボタンとして出す。
// サイドバーには全体の流れと現在地の案内だけを表示し、実際の操作ボタンは画面右下に固定表示する
// （幅を問わず同じ位置にすることで、操作に迷わないようにするため）。
export const EventStatusActions: React.FC<SelectFieldClientProps> = ({ path }) => {
  const { value, setValue } = useField<EventStatus>({ path })
  const { value: slug } = useField<string>({ path: 'slug' })
  const { value: authorName } = useField<string>({ path: 'createdByUsername' })
  const { value: requesterName } = useField<string>({ path: 'reviewRequestedByUsername' })
  const { setModified, submit } = useForm()
  const { id, collectionSlug } = useDocumentInfo()
  const { toggleModal } = useModal()
  const { user } = useAuth()
  const role = ((user as { role?: Role } | null)?.role ?? 'editor') as Role
  const currentStatus = (value ?? 'draft') as EventStatus
  const transitions = actionsFor(currentStatus, role).filter((action) => !action.requiresReview || role === 'reviewer' || role === 'admin')
  // 「保存する」は下書き中の内容保持のためだけの操作。確認待ち以降はステータス遷移ボタンが
  // 実質的に保存を兼ねるため、下書きのときだけ出す。
  const actions = currentStatus === 'draft' ? [saveAction(), ...transitions] : transitions
  const isPublicNow = currentStatus === 'published' || currentStatus === 'archived'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  // 公開中/過去のイベントは公開URLそのもの、下書き・確認待ちはステータスを無視して読めるプレビュー専用ルートを指す。
  // まだ一度も保存していない(id未確定の)新規作成中はどちらも参照できないため出さない。
  const previewUrl = !id ? null : isPublicNow && slug ? `${appUrl}/events/${slug}` : `${appUrl}/events/preview/${id}`
  const message = statusMessage(currentStatus, role === 'reviewer' || role === 'admin')
  const deleteMessage = deleteNote(currentStatus)

  // 公開中/過去のイベントは本文系フィールドがすべてaccess.updateでreadOnlyになり実際には
  // 編集できないが、フォーム初期化のタイミングでPayload側のmodifiedフラグが誤って立つことがあり、
  // 何も変更していないのに他ページへ移動しようとすると「内容が保存されていません」の確認が出てしまう。
  // 実際に編集できない状態なので、表示直後にmodifiedを一度リセットしておく。
  useEffect(() => {
    if (currentStatus !== 'published' && currentStatus !== 'archived') return
    const timer = setTimeout(() => setModified(false), 0)
    return () => clearTimeout(timer)
  }, [currentStatus, setModified])

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
      <ConfirmationModal
        modalSlug={editConfirmModalSlug}
        heading="編集しますか？"
        body="下書きに戻します。この瞬間からサイトには表示されなくなります。よろしいですか？"
        confirmLabel="編集する"
        cancelLabel="キャンセル"
        onConfirm={() => handleClick('draft')}
      />
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
        {message && <div className="event-status-actions__message">{message}</div>}
        {deleteMessage && <div className="event-status-actions__message">{deleteMessage}</div>}
        {(authorName || requesterName) && (
          <div className="event-status-actions__people">
            {authorName && <div>作成者: {authorName}</div>}
            {requesterName && <div>確認依頼者: {requesterName}</div>}
          </div>
        )}
        {previewUrl && (
          <a className="event-status-actions__preview-link" href={previewUrl} target="_blank" rel="noreferrer">
            {isPublicNow ? '公開ページを開く ↗' : 'プレビューを開く ↗'}
          </a>
        )}
      </div>
      <div className="event-status-actions__bar">
        {actions.map((action) => (
          <Button
            key={action.key}
            buttonStyle={action.style ?? 'primary'}
            size="small"
            onClick={() => (action.requiresConfirm ? toggleModal(editConfirmModalSlug) : handleClick(action.to))}
            tooltip={action.description}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </>
  )
}

export default EventStatusActions
