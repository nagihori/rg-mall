import type { CollectionConfig } from 'payload'
import { canEdit, isAdmin } from '../access'

export const Media: CollectionConfig = { slug: 'media', access: { read: canEdit, create: canEdit, update: canEdit, delete: isAdmin }, fields: [
  { name: 'storageKey', type: 'text', required: true, unique: true }, { name: 'url', type: 'text', required: true }, { name: 'alt', type: 'text', required: true }, { name: 'credit', type: 'text' }, { name: 'rightsNote', type: 'textarea', required: true },
  { name: 'width', type: 'number', required: true }, { name: 'height', type: 'number', required: true }, { name: 'mimeType', type: 'select', required: true, options: ['image/jpeg', 'image/png', 'image/webp'] },
] }
