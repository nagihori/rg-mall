import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'
export const AuditLogs: CollectionConfig = { slug: 'auditLogs', admin: { useAsTitle: 'action' }, access: { read: isAdmin, create: () => false, update: () => false, delete: () => false }, fields: [
  { name: 'action', type: 'select', required: true, options: ['published', 'unpublished', 'archived', 'deleted', 'role_changed', 'returned_to_draft'] }, { name: 'event', type: 'relationship', relationTo: 'events' }, { name: 'actor', type: 'relationship', relationTo: 'users' }, { name: 'targetUser', type: 'relationship', relationTo: 'users' }, { name: 'reason', type: 'textarea' },
] }
