import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { canEdit, canReview, canTrashDraft } from '../access'
import { normalizeSummary, normalizeTitle, numberedSlug, slugFromTitle } from '@/lib/normalize/event'
import { eventInputSchema } from '@/lib/validate/event'
import { canTransition, type EventStatus } from '@/lib/domain/events'
import { recordEventTransition } from '../audit'
import { notifyArchived, notifyPublished, notifyReturnedToDraft, notifyReviewRequested } from '@/lib/integrations/discord'

const statusLabels: Record<EventStatus, string> = { draft: '下書き', in_review: '確認待ち', published: 'トップページに表示中', archived: '過去のイベント' }
// 日時は表記揺れを避けるため常に YYYY/MM/DD HH:mm(24時間表記)で統一する。
const dateTimeAdmin = { date: { pickerAppearance: 'dayAndTime' as const, displayFormat: 'yyyy/MM/dd HH:mm', timeFormat: 'HH:mm' } }

export const Events: CollectionConfig = {
  slug: 'events', labels: { singular: 'イベント', plural: 'イベント' }, admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'createdByUsername', 'reviewRequestedByUsername', 'updatedAt'], components: { edit: { beforeDocumentControls: ['./src/cms/components/BackToListLink.tsx'] }, beforeList: ['./src/cms/components/EventListFilters.tsx'] } }, versions: { drafts: true, maxPerDoc: 20 }, trash: true,
  access: { read: canEdit, create: canEdit, update: canEdit, delete: canTrashDraft },
  hooks: {
    beforeValidate: [async ({ data, operation, req }) => {
      const next = data ?? {}
      if (next.title) {
        next.title = normalizeTitle(String(next.title))
        if (operation === 'create' && !next.slug) {
          // ゴミ箱に移動した記事もslugのユニーク制約は生き続ける(削除ではなくdeletedAtが付くだけ)ため、
          // 重複チェックはゴミ箱の記事も含めて行わないとDB側のユニーク制約違反になり得る。
          // (日本語だけのタイトルはslugFromTitleが'event'に落ちるため特に衝突しやすい)
          const existing = await req.payload.find({ collection: 'events', limit: 1000, select: { slug: true }, trash: true })
          next.slug = numberedSlug(slugFromTitle(String(next.title)), existing.docs.map((doc) => String(doc.slug)))
        }
      }
      if (next.summary) next.summary = normalizeSummary(String(next.summary))
      return next
    }],
    beforeChange: [({ data, originalDoc, operation, req }) => {
      const next = data ?? {}
      // フィールド追加前に作られた記事はcreatedByDiscordId/Usernameが無いため、未設定ならそのつど今の編集者情報で埋める。
      if (!next.createdByDiscordId && !originalDoc?.createdByDiscordId) next.createdByDiscordId = req.user?.discordId
      if (!next.createdByUsername && !originalDoc?.createdByUsername) next.createdByUsername = req.user?.discordUsername
      const previousStatus = originalDoc?.status as EventStatus | undefined
      let nextStatus = (next.status ?? previousStatus ?? 'draft') as EventStatus
      // 確認依頼を出すたびに「誰が今回依頼したか」を上書きする（作成者と依頼者が違うケースがあるため createdBy とは別管理）。
      if (previousStatus !== 'in_review' && nextStatus === 'in_review') {
        next.reviewRequestedByDiscordId = req.user?.discordId
        next.reviewRequestedByUsername = req.user?.discordUsername
      }
      const editorRole = req.user?.role === 'pending' ? 'editor' : (req.user?.role ?? 'editor')
      if (previousStatus === 'published' && nextStatus === 'published') {
        // 公開中の内容を変更して保存した場合は確認待ちへ戻す。サイト側は status===published/archived のみ表示するため
        // レビューが済むまでその間サイトから見えなくなる（公開版を保ったまま裏で直せる仕組みではない）。
        nextStatus = 'in_review'
        next.status = nextStatus
      } else if (previousStatus && nextStatus !== previousStatus && !canTransition(previousStatus, nextStatus, editorRole)) {
        throw new APIError(`ステータスを「${statusLabels[previousStatus] ?? previousStatus}」から「${statusLabels[nextStatus] ?? nextStatus}」へ直接変更することはできません`, 400)
      }
      if (nextStatus === 'published' && !canReview({ req })) throw new APIError('公開は確認者または管理者のみ実行できます', 403)
      if (nextStatus === 'published') {
        const parsed = eventInputSchema.safeParse(next)
        if (!parsed.success) throw new APIError(parsed.error.issues.map((issue) => issue.message).join(' / '), 400)
        next.publishedAt = new Date().toISOString()
      }
      return next
    }],
    afterChange: [async ({ doc, previousDoc, req }) => {
      if (doc.status === previousDoc?.status) return doc
      const action = doc.status === 'published' ? 'published' : doc.status === 'archived' ? 'archived' : doc.status === 'draft' && previousDoc?.status === 'in_review' ? 'returned_to_draft' : null
      if (action) await recordEventTransition(req, doc.id, action)
      const editUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/collections/events/${doc.id}`
      const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/preview/${doc.id}`
      const requester = req.user?.discordUsername ?? '不明なユーザー'
      try {
        if (doc.status === 'in_review' && previousDoc?.status === 'draft') {
          await notifyReviewRequested({ eventTitle: doc.title, requester, reviewUrl: editUrl, previewUrl })
        } else if (doc.status === 'draft' && previousDoc?.status === 'in_review' && req.user?.role !== 'editor') {
          // 編集者自身が確認依頼を取り下げた場合は通知不要。確認者/管理者が差し戻した場合のみ編集者へ知らせる。
          await notifyReturnedToDraft({ eventTitle: doc.title, reviewer: requester, editUrl, authorDiscordId: doc.createdByDiscordId })
        } else if (doc.status === 'published') {
          const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${doc.slug}`
          const author = doc.createdByUsername ?? requester
          await notifyPublished({ eventTitle: doc.title, requester: author, summary: doc.summary, publicUrl })
        } else if (doc.status === 'archived' && previousDoc?.status === 'published') {
          // 開催終了による自動アーカイブ(cron)はreq.userを持たないため、実行者名を分けて表示する。
          await notifyArchived({ eventTitle: doc.title, actor: req.user?.discordUsername ?? 'システム(開催終了による自動アーカイブ)' })
        }
      } catch (err) {
        req.payload.logger.error({ err }, 'Discord通知の送信に失敗しました')
      }
      return doc
    }],
    afterDelete: [async ({ doc, req }) => { await recordEventTransition(req, doc.id, 'deleted'); return doc }],
  },
  fields: [
    // 公開中は内容を直接編集できない設計。「編集する」ボタンで一旦下書きに戻してから編集する運用のため、
    // status===published の間は本文系フィールドをすべて表示専用にする（access.updateがfalseを返すとPayloadが自動でreadOnly表示にする）。
    { name: 'title', type: 'text', label: 'タイトル', required: true, maxLength: 80, access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'summary', type: 'textarea', label: '概要', required: true, maxLength: 160, admin: { description: '一覧やSNSシェアに表示される紹介文（160文字以内）' }, access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'body', type: 'richText', label: '本文', access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'heroImage', type: 'relationship', label: 'メイン画像', relationTo: 'media', access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'galleryImages', type: 'relationship', label: 'ギャラリー画像', relationTo: 'media', hasMany: true, access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'startsAt', type: 'date', label: '開始日時', admin: { position: 'sidebar', ...dateTimeAdmin }, access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'endsAt', type: 'date', label: '終了日時', admin: { position: 'sidebar', ...dateTimeAdmin }, access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'location', type: 'text', label: '場所', admin: { position: 'sidebar', description: '開催場所（自由入力）' }, access: { update: ({ data }) => data?.status !== 'published' } },
    { name: 'publishedAt', type: 'date', label: '公開日時', admin: { position: 'sidebar', readOnly: true, ...dateTimeAdmin } },
    // URLに使うslugは編集者が普段意識する必要がないため、サイドバーの下の方に控えめに表示するだけにする。
    // 値はbeforeValidateフックがサーバー側で自動生成するもので編集者が入力する項目ではないため、
    // required: trueにすると新規作成時(まだ生成前でクライアント側は空)に「必須」エラー＆*表示が出てしまう。
    // 実際の必須チェックはこのvalidateだけで行う(更新時は空を許さない・作成時はフックに任せて素通りさせる)。
    {
      name: 'slug', type: 'text', label: 'スラッグ', unique: true, admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.slug) },
      validate: (value: string | null | undefined, { operation }: { operation?: string }) => (operation === 'create' ? true : (Boolean(value) || 'スラッグは必須です')),
    },
    {
      name: 'status', type: 'select', label: 'ステータス', required: true, defaultValue: 'draft',
      // versions.drafts が内部的に追加する `_status` フィールドとPostgres enum型名が
      // 衝突する（toSnakeCase('_status') === toSnakeCase('status')）ため、enumNameで分離する。
      enumName: 'enum_events_review_status',
      options: [{ label: '下書き', value: 'draft' }, { label: '確認待ち', value: 'in_review' }, { label: 'トップページに表示中', value: 'published' }, { label: '過去のイベント', value: 'archived' }],
      // 操作ボタンは画面右下に固定表示するカスタムUIに統一しているため、ここはワークフローの説明表示に徹する。
      // (Payload標準の「ドラフトを保存/変更内容を公開」はsrc/cms/components/admin.cssで非表示にしている)
      admin: { position: 'sidebar', components: { Field: './src/cms/components/EventStatusActions.tsx' } },
    },
    { name: 'sourceEvent', type: 'relationship', label: '元記事', relationTo: 'events', admin: { readOnly: true, description: '公開済みイベントから作成した作業下書きの元記事', condition: (data) => Boolean(data?.sourceEvent) } },
    // DiscordIDは差し戻し通知でのメンションや「自分の記事のみ表示」の絞り込みにのみ使う内部値なので画面には出さない。
    { name: 'createdByDiscordId', type: 'text', label: '作成者DiscordID', admin: { hidden: true } },
    { name: 'createdByUsername', type: 'text', label: '作成者', admin: { readOnly: true, position: 'sidebar', condition: (data) => Boolean(data?.createdByUsername) } },
    // 直近の確認依頼者。作成者と依頼者が異なるケース（他の編集者が引き継いで依頼するなど）があるため別管理し、
    // 一覧・レビュー画面（EventStatusActions）で「誰が書いたか」と並べて表示する。
    { name: 'reviewRequestedByDiscordId', type: 'text', label: '確認依頼者DiscordID', admin: { hidden: true } },
    { name: 'reviewRequestedByUsername', type: 'text', label: '確認依頼者', admin: { readOnly: true, position: 'sidebar', condition: (data) => Boolean(data?.reviewRequestedByUsername), components: { Cell: './src/cms/components/DashIfEmptyCell.tsx' } } },
  ],
}
