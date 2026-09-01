import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv
loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)))

const applicationId = process.env.DISCORD_CLIENT_ID
const botToken = process.env.DISCORD_BOT_TOKEN

if (!applicationId || !botToken) {
  throw new Error('DISCORD_CLIENT_ID and DISCORD_BOT_TOKEN must be set to register commands.')
}

const commands = [
  { name: 'tccheck', description: 'Vercelの無料枠使用量(Blob Storage)を確認します' },
  {
    name: 'newevent',
    description: '新しいイベントを下書きとして作成します',
    options: [{ name: 'title', description: 'イベント名', type: 3, required: true }],
  },
]

const response = await fetch(`https://discord.com/api/v10/applications/${applicationId}/commands`, {
  method: 'PUT',
  headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(commands),
})

if (!response.ok) {
  throw new Error(`Failed to register commands: ${response.status} ${await response.text()}`)
}

console.log('Registered commands:', await response.json())
