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
