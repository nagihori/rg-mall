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
import { Users } from './src/cms/collections/users'
import { Media } from './src/cms/collections/media'
import { AuditLogs } from './src/cms/collections/auditLogs'

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
  collections: [Users, Events, Media, AuditLogs],
  plugins: [
    vercelBlobStorage({
      collections: { media: true },
      addRandomSuffix: true,
      // Vercel上ではデフォルト挙動(BLOB_READ_WRITE_TOKEN / OIDC接続)のまま。
      // ローカルはVercelと分離したBLOB_LOCAL_READ_WRITE_TOKENを明示指定する。
      token: process.env.VERCEL ? undefined : process.env.BLOB_LOCAL_READ_WRITE_TOKEN,
    }),
  ],
  db: postgresAdapter({
    pool: { connectionString: databaseURL },
    migrationDir: './src/migrations',
  }),
  typescript: { outputFile: './src/payload-types.ts' },
})
