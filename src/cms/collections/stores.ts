import type { CollectionConfig } from 'payload'
import { canEdit } from '../access'
import { normalizeSummary, normalizeTitle, numberedSlug, slugFromTitle } from '@/lib/normalize/event'
import { isLodestoneCharacterUrl, normalizeLodestoneCharacterInput } from '@/lib/normalize/store'
import { revalidatePublicStorePaths } from '@/lib/cache/revalidateStores'

export const Stores: CollectionConfig = {
  slug: 'stores', labels: { singular: '所属店舗', plural: '所属店舗' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'owner', 'updatedAt'], components: { edit: { beforeDocumentControls: ['./src/cms/components/BackToListLink.tsx'] } } },
  // レビュー承認フローは持たず、Payload標準の下書き/公開のみを使う(公開後の編集も一旦下書き版になり、
  // 「公開する」を押すまで公開ページには反映されない)。
  versions: { drafts: true, maxPerDoc: 20 },
  trash: true,
  access: { read: canEdit, create: canEdit, update: canEdit, delete: canEdit },
  hooks: {
    beforeValidate: [async ({ data, operation, req }) => {
      const next = data ?? {}
      if (next.name) {
        next.name = normalizeTitle(String(next.name))
        if (operation === 'create' && !next.slug) {
          // ゴミ箱に移動した店舗もslugのユニーク制約は生き続けるため、重複チェックはゴミ箱の店舗も含めて行う。
          const existing = await req.payload.find({ collection: 'stores', limit: 1000, select: { slug: true }, trash: true })
          next.slug = numberedSlug(slugFromTitle(String(next.name)), existing.docs.map((doc) => String(doc.slug)))
        }
      }
      if (next.summary) next.summary = normalizeSummary(String(next.summary))
      // キャラクターIDだけの入力を正規のLodestone URLへ組み立ててから保存する(表示側は常に完成したURLを扱えばよくなる)。
      if (next.ownerLodestoneEnabled && next.ownerLodestoneUrl) next.ownerLodestoneUrl = normalizeLodestoneCharacterInput(String(next.ownerLodestoneUrl))
      return next
    }],
    afterChange: [async ({ doc }) => {
      revalidatePublicStorePaths(doc.slug)
      return doc
    }],
    afterDelete: [async ({ doc }) => {
      revalidatePublicStorePaths(doc.slug)
    }],
  },
  // フィールドの並びは公開ページの表示順(カバー画像→店舗名→概要→オーナー→基本営業時間→本文→ギャラリー)に揃える。
  fields: [
    { name: 'name', type: 'text', label: '店舗名', required: true, maxLength: 60 },
    { name: 'tagline', type: 'text', label: 'タグライン', maxLength: 20, admin: { description: '例: カフェ併設文具店（一覧のメイン画像に重ねて表示、詳細ページでは店舗名の上に表示）' } },
    { name: 'coverImage', type: 'relationship', label: 'カバー画像', relationTo: 'media', admin: { description: '店舗詳細ページ上部に横長で表示される看板画像' } },
    { name: 'mainImage', type: 'relationship', label: 'メイン画像', relationTo: 'media', admin: { description: '概要文の隣に正方形で表示されるメイン画像' } },
    { name: 'summary', type: 'textarea', label: '概要', required: true, maxLength: 160, admin: { description: '一覧に表示される紹介文（160文字以内）' } },
    { name: 'owner', type: 'text', label: 'オーナー', required: true, maxLength: 60 },
    { name: 'avatar', type: 'relationship', label: 'アバター', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'ownerLodestoneEnabled', type: 'checkbox', label: 'Lodestoneキャラクターページをリンクする', defaultValue: false, admin: { width: '50%' } },
        {
          name: 'ownerLodestoneUrl', type: 'text', label: 'URL または キャラクターID',
          admin: {
            width: '50%', condition: (data) => Boolean(data?.ownerLodestoneEnabled),
            description: '例: https://jp.finalfantasyxiv.com/lodestone/character/12345678/ または 12345678（別タブで開きます）',
          },
          validate: (value: string | null | undefined, { siblingData }: { siblingData?: { ownerLodestoneEnabled?: boolean } }) => {
            if (!siblingData?.ownerLodestoneEnabled) return true
            if (!value) return 'リンクする場合はURLまたはキャラクターIDが必須です'
            return isLodestoneCharacterUrl(normalizeLodestoneCharacterInput(value)) || 'LodestoneキャラクターページのURL、またはキャラクターID(数字)を入力してください'
          },
        },
      ],
    },
    { name: 'businessHours', type: 'text', label: '基本営業時間', maxLength: 120, admin: { description: '例: 毎週土曜 21:00〜24:00（自由入力）' } },
    {
      name: 'snsLinks', type: 'array', label: 'SNSリンク', labels: { singular: 'リンク', plural: 'リンク' },
      admin: { description: 'X(Twitter)やDiscordなど、店舗のSNS等へのリンクを複数登録できます' },
      fields: [
        { name: 'label', type: 'text', label: '表示名', maxLength: 40, admin: { description: '例: X (Twitter)' } },
        { name: 'url', type: 'text', label: 'URL', required: true },
      ],
    },
    { name: 'body', type: 'richText', label: '本文' },
    { name: 'galleryImages', type: 'relationship', label: 'ギャラリー画像', relationTo: 'media', hasMany: true },
    {
      name: 'slug', type: 'text', label: 'スラッグ', unique: true, admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.slug) },
      validate: (value: string | null | undefined, { operation }: { operation?: string }) => (operation === 'create' ? true : (Boolean(value) || 'スラッグは必須です')),
    },
  ],
}
