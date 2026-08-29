import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
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
    components: { beforeLogin: ['./src/cms/components/DiscordLoginButton.tsx'] },
  },
  editor: lexicalEditor(),
  collections: [Users, Events, Media, AuditLogs],
  db: postgresAdapter({
    pool: { connectionString: databaseURL },
    migrationDir: './src/migrations',
  }),
  typescript: { outputFile: './src/payload-types.ts' },
})
