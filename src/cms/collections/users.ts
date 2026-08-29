import type { CollectionConfig } from 'payload'
import { JWTAuthentication } from 'payload'
import { isAdmin } from '../access'
import { recordRoleChange } from '../audit'

export const Users: CollectionConfig = { slug: 'users', labels: { singular: 'ユーザー', plural: 'ユーザー' }, auth: { disableLocalStrategy: true, useSessions: false, strategies: [{ name: 'local-jwt', authenticate: JWTAuthentication }] }, admin: { useAsTitle: 'discordUsername', defaultColumns: ['discordUsername', 'discordId', 'role', 'createdAt'] }, access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin }, hooks: { afterChange: [async ({ doc, previousDoc, req, operation }) => { if (operation === 'update' && doc.role !== previousDoc?.role) await recordRoleChange(req, doc.id); return doc }] }, fields: [
  { name: 'discordId', type: 'text', label: 'Discord ID', required: true, unique: true }, { name: 'discordUsername', type: 'text', label: 'Discordユーザー名', required: true },
  { name: 'role', type: 'select', label: '権限', required: true, defaultValue: 'editor', options: [{ label: '承認待ち', value: 'pending' }, { label: '編集者', value: 'editor' }, { label: '確認者', value: 'reviewer' }, { label: '管理者', value: 'admin' }] },
] }
