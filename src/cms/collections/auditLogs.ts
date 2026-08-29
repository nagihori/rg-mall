import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'
export const AuditLogs: CollectionConfig = { slug: 'auditLogs', labels: { singular: '監査ログ', plural: '監査ログ' }, admin: { useAsTitle: 'action' }, access: { read: isAdmin, create: () => false, update: () => false, delete: () => false }, fields: [
  { name: 'action', type: 'select', label: 'アクション', required: true, options: [{ label: '公開', value: 'published' }, { label: '非公開', value: 'unpublished' }, { label: 'アーカイブ', value: 'archived' }, { label: '削除', value: 'deleted' }, { label: '権限変更', value: 'role_changed' }, { label: '下書きに戻す', value: 'returned_to_draft' }] }, { name: 'event', type: 'relationship', label: 'イベント', relationTo: 'events' }, { name: 'actor', type: 'relationship', label: '実行者', relationTo: 'users' }, { name: 'targetUser', type: 'relationship', label: '対象ユーザー', relationTo: 'users' }, { name: 'reason', type: 'textarea', label: '理由' },
] }
