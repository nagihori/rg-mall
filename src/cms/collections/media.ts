import type { CollectionConfig } from 'payload'
import { canEdit, isAdmin } from '../access'

export const Media: CollectionConfig = {
  slug: 'media', labels: { singular: 'メディア', plural: 'メディア' }, access: { read: canEdit, create: canEdit, update: canEdit, delete: isAdmin },
  admin: {
    defaultColumns: ['filename', 'alt', 'uploadedBy', 'updatedAt'],
    components: { beforeList: ['./src/cms/components/MediaListDefaultFilter.tsx'] },
  },
  upload: { mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  hooks: {
    beforeChange: [({ data, operation, req }) => {
      if (operation === 'create' && !data?.uploadedBy) data.uploadedBy = req.user?.id
      return data
    }],
  },
  fields: [
    {
      name: 'alt', type: 'text', label: '代替テキスト', required: true,
      admin: { description: '画像が表示できない場合や読み上げ時に代わりに使われる説明文です。何が写っているかを簡潔に(例:「祭りの会場の様子」)' },
    },
    { name: 'rightsNote', type: 'textarea', label: '権利メモ', admin: { description: '(C)Square EnixやAI生成など (SSは基本的にスクエニに帰属)' } },
    {
      name: 'uploadedBy', type: 'relationship', relationTo: 'users', label: 'アップロード者',
      admin: { readOnly: true, condition: (_, __, { operation }) => operation !== 'create' },
    },
  ],
}
