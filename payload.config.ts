import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { en } from '@payloadcms/translations/languages/en'
import { ja } from '@payloadcms/translations/languages/ja'
import { Events } from './src/cms/collections/events'
import { Stores } from './src/cms/collections/stores'
import { Users } from './src/cms/collections/users'
import { Media } from './src/cms/collections/media'
import { AuditLogs } from './src/cms/collections/auditLogs'
import { VercelUsageMonitor } from './src/cms/globals/vercelUsageMonitor'

const databaseURL = process.env.DATABASE_URL
const configDir = dirname(fileURLToPath(import.meta.url))

if (!databaseURL) {
  throw new Error('DATABASE_URL must be set for the Next.js / Payload application.')
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'development-only-change-me',
  admin: {
    user: 'users',
    importMap: { baseDir: configDir },
    components: {
      beforeLogin: ['./src/cms/components/DiscordLoginButton.tsx'],
      providers: ['./src/cms/components/AdminFont.tsx'],
    },
  },
  i18n: {
    fallbackLanguage: 'ja',
    supportedLanguages: { ja, en },
    // 一覧の一括削除/ゴミ箱移動は、対象外(下書き以外)の記事を含む場合にエラーなく黙って0件処理される
    // Payload標準の仕様があり、その際の成功トーストが「0件を削除しました」のように見えて紛らわしいため、
    // 件数0の場合だけ文言を上書きする（1件以上削除できた場合の通常文言はそのまま）。
    translations: {
      ja: {
        general: {
          deletedCountSuccessfully_zero: '0件でした。選択した記事は下書き状態ではないため削除できません。',
          permanentlyDeletedCountSuccessfully_zero: '0件でした。選択した記事は下書き状態ではないため完全削除できません。',
          trashedCountSuccessfully_zero: '0件でした。選択した記事は下書き状態ではないためゴミ箱に移動できません。',
        },
      },
    },
  },
  editor: lexicalEditor(),
  sharp,
  collections: [Users, Events, Stores, Media, AuditLogs],
  globals: [VercelUsageMonitor],
  plugins: [
    vercelBlobStorage({
      collections: {
        media: {
          // falseのままだと画像配信がPayload内蔵の/api/media/file/[filename]ルート経由になり、
          // mediaコレクションのaccess.read(editor/reviewer/admin限定)がファイル取得のたびに評価される。
          // 結果、ログインしていない一般訪問者は画像を一切取得できず403になる(公開ページの画像が
          // 出たり出なかったりする不具合の原因だった)。Blobバケット自体は公開設定なので、
          // ここを外して直接Blobの公開URLを返すようにする。
          disablePayloadAccessControl: true,
        },
      },
      // addRandomSuffix:trueは既知の未修正バグでimageSizesと組み合わせると発火する
      // (originalとサイズ違いの複数アップロードが同じdocオブジェクトを共有して並行実行され、
      // 最後に完了したものでfilenameが上書きされ、他のサイズのURLが404になる)。
      // https://github.com/payloadcms/payload/issues/9589
      // Payload本体側の衝突回避(getSafeFileName)で十分なため、ここでは有効化しない。
      addRandomSuffix: false,
      // storage-vercel-blobはtokenが未指定だとアダプタ自体を無効化する(自動フォールバックはない)ため、
      // Vercel上ではBLOB_READ_WRITE_TOKEN(環境ごとにスコープされた値)を明示的に渡す。
      // ローカルはVercelと分離したBLOB_LOCAL_READ_WRITE_TOKENを使う。
      token: process.env.VERCEL ? process.env.BLOB_READ_WRITE_TOKEN : process.env.BLOB_LOCAL_READ_WRITE_TOKEN,
    }),
  ],
  db: postgresAdapter({
    pool: { connectionString: databaseURL },
    migrationDir: './src/migrations',
  }),
  typescript: { outputFile: './src/payload-types.ts' },
})
