import type { CollectionConfig } from 'payload'
import { JWTAuthentication } from 'payload'
import { isAdmin } from '../access'
import { recordRoleChange } from '../audit'

export const Users: CollectionConfig = { slug: 'users', auth: { disableLocalStrategy: true, useSessions: false, strategies: [{ name: 'local-jwt', authenticate: JWTAuthentication }] }, admin: { useAsTitle: 'discordUsername' }, access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin }, hooks: { afterChange: [async ({ doc, previousDoc, req }) => { if (previousDoc && doc.role !== previousDoc.role) await recordRoleChange(req, doc.id); return doc }] }, fields: [
  { name: 'discordId', type: 'text', required: true, unique: true }, { name: 'discordUsername', type: 'text', required: true },
  { name: 'role', type: 'select', required: true, defaultValue: 'editor', options: ['editor', 'reviewer', 'admin'] },
] }
