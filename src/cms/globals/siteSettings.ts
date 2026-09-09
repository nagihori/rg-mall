import type { GlobalConfig } from 'payload'
import { canEdit } from '../access'
import { revalidatePublicSitePaths } from '@/lib/cache/revalidateSiteSettings'

// フッターに表示する商店街全体の情報(名称・所在地・連絡先・追加メンバー募集)。全ページ共通のため
// 読み取りは常に許可し、更新は他の記事コレクションと同じくcanEdit(editor以上)に揃える。
export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: '商店街設定',
  access: { read: () => true, update: canEdit },
  hooks: {
    afterChange: [async ({ doc }) => {
      revalidatePublicSitePaths()
      return doc
    }],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'ヘッダー',
          fields: [
            { name: 'headerImage', type: 'relationship', relationTo: 'media', label: 'ヘッダー画像(ロゴ)', admin: { description: '未設定の場合は既定の画像を使用します' } },
            { name: 'tagline', type: 'textarea', label: 'タグライン', maxLength: 200 },
          ],
        },
        {
          label: 'フッター',
          fields: [
            { name: 'footerImage', type: 'relationship', relationTo: 'media', label: 'フッター背景画像', admin: { description: '未設定の場合は既定の画像を使用します' } },
            { name: 'mallName', type: 'text', label: '商店街名', required: true, maxLength: 60 },
            { name: 'server', type: 'text', label: 'サーバー', maxLength: 60 },
            { name: 'location', type: 'text', label: '所在地', maxLength: 120 },
            { name: 'contactText', type: 'text', label: 'お問い合わせ', maxLength: 120 },
            {
              type: 'row',
              fields: [
                { name: 'contactLinkEnabled', type: 'checkbox', label: 'お問い合わせにリンクを張る', defaultValue: false, admin: { width: '50%' } },
                {
                  name: 'contactLinkUrl', type: 'text', label: 'リンク先URL',
                  admin: { width: '50%', condition: (data) => Boolean(data?.contactLinkEnabled), description: '別タブで開きます' },
                  validate: (value: string | null | undefined, { siblingData }: { siblingData?: { contactLinkEnabled?: boolean } }) => {
                    if (!siblingData?.contactLinkEnabled) return true
                    return Boolean(value) || 'リンクする場合はURLが必須です'
                  },
                },
              ],
            },
            { name: 'recruitingEnabled', type: 'checkbox', label: '追加メンバー募集を表示', defaultValue: false },
            {
              name: 'recruitingText', type: 'text', label: '募集文言', maxLength: 80,
              admin: { condition: (data) => Boolean(data?.recruitingEnabled), description: '例: FINAL FANTASY XIV ルーガンド商会 追加メンバー募集中' },
              validate: (value: string | null | undefined, { siblingData }: { siblingData?: { recruitingEnabled?: boolean } }) => {
                if (!siblingData?.recruitingEnabled) return true
                return Boolean(value) || '表示する場合は文言が必須です'
              },
            },
            {
              name: 'recruitingUrl', type: 'text', label: '募集リンク先URL',
              admin: { condition: (data) => Boolean(data?.recruitingEnabled), description: '別タブで開きます' },
              validate: (value: string | null | undefined, { siblingData }: { siblingData?: { recruitingEnabled?: boolean } }) => {
                if (!siblingData?.recruitingEnabled) return true
                return Boolean(value) || '表示する場合はリンク先URLが必須です'
              },
            },
          ],
        },
      ],
    },
  ],
}
