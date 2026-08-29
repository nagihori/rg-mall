import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv

if (process.env.VERCEL) {
  throw new Error('Migrations must run outside Vercel. DATABASE_ADMIN_URL is not a Vercel environment variable.')
}

loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)))

const databaseAdminURL = process.env.DATABASE_ADMIN_URL

if (!databaseAdminURL) {
  throw new Error('DATABASE_ADMIN_URL must be set locally to run migrations.')
}

const payloadBin = fileURLToPath(new URL('../node_modules/payload/bin.js', import.meta.url))
const result = spawnSync(process.execPath, [payloadBin, 'migrate'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Payload reads DATABASE_URL. Only this migration child process receives the direct URL.
    DATABASE_URL: databaseAdminURL,
  },
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
