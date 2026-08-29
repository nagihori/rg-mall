import type { CollectionConfig } from 'payload'
import { canEdit, isAdmin } from '../access'

export const Media: CollectionConfig = { slug: 'media', labels: { singular: 'メディア', plural: 'メディア' }, access: { read: canEdit, create: canEdit, update: canEdit, delete: isAdmin }, fields: [
  { name: 'storageKey', type: 'text', label: 'ストレージキー', required: true, unique: true }, { name: 'url', type: 'text', label: 'URL', required: true }, { name: 'alt', type: 'text', label: '代替テキスト', required: true }, { name: 'credit', type: 'text', label: 'クレジット' }, { name: 'rightsNote', type: 'textarea', label: '権利メモ', required: true },
  { name: 'width', type: 'number', label: '幅', required: true }, { name: 'height', type: 'number', label: '高さ', required: true }, { name: 'mimeType', type: 'select', label: 'MIMEタイプ', required: true, options: ['image/jpeg', 'image/png', 'image/webp'] },
] }
