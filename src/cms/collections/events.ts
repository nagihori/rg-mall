import type { CollectionConfig } from 'payload'
import { canEdit, canReview, isAdmin } from '../access'
import { normalizeSummary, normalizeTitle, numberedSlug, slugFromTitle } from '@/lib/normalize/event'
import { eventInputSchema } from '@/lib/validate/event'
import { assertTransition } from '@/lib/domain/events'
import { recordEventTransition } from '../audit'

export const Events: CollectionConfig = {
  slug: 'events', labels: { singular: 'イベント', plural: 'イベント' }, admin: { useAsTitle: 'title', defaultColumns: ['title', 'status', 'updatedAt'] }, versions: { drafts: true, maxPerDoc: 20 },
  access: { read: canEdit, create: canEdit, update: canEdit, delete: isAdmin },
  hooks: {
    beforeValidate: [async ({ data, operation, req }) => {
      const next = data ?? {}
      if (next.title) { next.title = normalizeTitle(String(next.title)); if (operation === 'create' && !next.slug) { const existing = await req.payload.find({ collection: 'events', limit: 1000, select: { slug: true } }); next.slug = numberedSlug(slugFromTitle(String(next.title)), existing.docs.map((doc) => String(doc.slug))) } }
      if (next.summary) next.summary = normalizeSummary(String(next.summary))
      return next
    }],
    beforeChange: [({ data, originalDoc, req }) => {
      const next = data ?? {}; const nextStatus = next.status ?? originalDoc?.status ?? 'draft'
      const previousStatus = originalDoc?.status
      const editorRole = req.user?.role === 'pending' ? 'editor' : (req.user?.role ?? 'editor')
      if (previousStatus && nextStatus !== previousStatus) assertTransition(previousStatus as 'draft' | 'in_review' | 'published' | 'archived', nextStatus as 'draft' | 'in_review' | 'published' | 'archived', editorRole)
      if (nextStatus === 'published' && !canReview({ req })) throw new Error('公開は確認者または管理者のみ実行できます')
      if (previousStatus === 'published' && nextStatus === 'published') throw new Error('公開版は直接編集できません。作業用下書きを作成してください。')
      if (nextStatus === 'published') { eventInputSchema.parse(next); next.publishedAt = new Date().toISOString() }
      return next
    }],
    afterChange: [async ({ doc, previousDoc, req }) => {
      if (doc.status === previousDoc?.status) return doc
      const action = doc.status === 'published' ? 'published' : doc.status === 'archived' ? 'archived' : doc.status === 'draft' && previousDoc?.status === 'in_review' ? 'returned_to_draft' : null
      if (action) await recordEventTransition(req, doc.id, action)
      return doc
    }],
    afterDelete: [async ({ doc, req }) => { await recordEventTransition(req, doc.id, 'deleted'); return doc }],
  },
  fields: [
    { name: 'title', type: 'text', label: 'タイトル', required: true, maxLength: 80 }, { name: 'slug', type: 'text', label: 'スラッグ', required: true, unique: true, admin: { readOnly: true } },
    { name: 'summary', type: 'textarea', label: '概要', required: true, minLength: 20, maxLength: 160 }, { name: 'body', type: 'richText', label: '本文', required: true },
    { name: 'heroImage', type: 'relationship', label: 'メイン画像', relationTo: 'media' }, { name: 'galleryImages', type: 'relationship', label: 'ギャラリー画像', relationTo: 'media', hasMany: true },
    { name: 'startsAt', type: 'date', label: '開始日時', admin: { date: { pickerAppearance: 'dayAndTime' } } }, { name: 'endsAt', type: 'date', label: '終了日時', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'status', type: 'select', label: 'ステータス', required: true, defaultValue: 'draft',
      // versions.drafts が内部的に追加する `_status` フィールドとPostgres enum型名が
      // 衝突する（toSnakeCase('_status') === toSnakeCase('status')）ため、enumNameで分離する。
      enumName: 'enum_events_review_status',
      options: [{ label: '下書き', value: 'draft' }, { label: '確認待ち', value: 'in_review' }, { label: '公開中', value: 'published' }, { label: 'アーカイブ', value: 'archived' }],
    },
    { name: 'publishedAt', type: 'date', label: '公開日時', admin: { readOnly: true } }, { name: 'sourceEvent', type: 'relationship', label: '元記事', relationTo: 'events', admin: { readOnly: true, description: '公開済みイベントから作成した作業下書きの元記事' } },
  ],
}
