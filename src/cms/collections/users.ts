import type { CollectionConfig } from 'payload'
import { JWTAuthentication } from 'payload'
import { isAdmin } from '../access'
import { recordRoleChange } from '../audit'
import { notifyUserApproved } from '@/lib/integrations/discord'

export const Users: CollectionConfig = { slug: 'users', labels: { singular: 'ユーザー', plural: 'ユーザー' }, auth: { disableLocalStrategy: true, useSessions: false, strategies: [{ name: 'local-jwt', authenticate: JWTAuthentication }] }, admin: { useAsTitle: 'discordUsername', defaultColumns: ['discordUsername', 'discordId', 'role', 'createdAt'] }, access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin }, hooks: { afterChange: [async ({ doc, previousDoc, req, operation }) => {
  if (operation === 'update' && doc.role !== previousDoc?.role) {
    await recordRoleChange(req, doc.id)
    if (previousDoc?.role === 'pending' && doc.role !== 'pending') {
      await notifyUserApproved({ discordUsername: doc.discordUsername, discordId: doc.discordId })
    }
  }
  return doc
}] }, fields: [
  { name: 'discordId', type: 'text', label: 'Discord ID', required: true, unique: true }, 
  // 管理画面・通知・記事の作成者表示に使う名前。初回ログイン時にDiscordのユーザー名で作られるが、以降はDiscord側と連動しない
  // (ログインのたびに上書きしない)ため、管理者が「誰か分かる名前」に変更できる。内部名はdiscordUsernameのままにしてカラムを変えない。
  { name: 'discordUsername', type: 'text', label: 'アカウント名', required: true, admin: { description: '管理画面・Discord通知・記事の作成者として表示される名前です。初回ログイン時はDiscordのユーザー名が入りますが、以降Discordとは連動しません。' } },
  { name: 'role', type: 'select', label: '権限', required: true, defaultValue: 'editor', options: [{ label: '承認待ち', value: 'pending' }, { label: '編集者', value: 'editor' }, { label: '確認者', value: 'reviewer' }, { label: '管理者', value: 'admin' }] },
] }
