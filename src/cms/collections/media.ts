import type { CollectionConfig } from 'payload'
import { canEdit, isAdmin } from '../access'

export const Media: CollectionConfig = {
  slug: 'media', labels: { singular: 'メディア', plural: 'メディア' }, access: { read: canEdit, create: canEdit, update: canEdit, delete: isAdmin },
  admin: {
    defaultColumns: ['filename', 'alt', 'uploadedBy', 'updatedAt'],
    components: {
      beforeList: ['./src/cms/components/MediaListDefaultFilter.tsx'],
      edit: { SaveButton: './src/cms/components/AutoCloseMediaDrawerButton.tsx' },
    },
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    // ゲームのスクリーンショット等、選択直後は数十MBになりうるファイルをVercel Functionsの
    // ボディサイズ上限(413)にかかる前にブラウザ側で縮小する。サーバー側の下記resizeOptions/
    // formatOptionsは、この事前リサイズをすり抜けた場合の二重の安全策として残す。
    admin: { components: { controls: ['./src/cms/components/AutoResizeUploadControl.tsx'] } },
    // 原本は長辺1600pxまでに縮小してBlobに保存(無料枠のストレージ・帯域を圧迫しないように)。
    // 詳細ページでの「拡大」表示にはこの原本(1600px)をそのまま使う想定。
    resizeOptions: { width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true },
    // 全サイズをwebpに変換して圧縮する(JPEG/PNGのままだと特にPNGで無駄にファイルが大きくなるため)。
    formatOptions: { format: 'webp', options: { quality: 80 } },
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 320, fit: 'cover', formatOptions: { format: 'webp', options: { quality: 75 } } },
      { name: 'card', width: 960, fit: 'inside', withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 78 } } },
      // 公開ページの通常表示(コンテナ幅約1152px)用。原本(1600px)より小さく、拡大表示と差を付ける。
      { name: 'detail', width: 1280, fit: 'inside', withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
    ],
  },
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
