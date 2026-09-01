import { createPublicKey, verify } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { fetchBlobStorageUsage } from '../../../../lib/integrations/vercelUsage'

const InteractionType = { PING: 1, APPLICATION_COMMAND: 2 } as const
const InteractionResponseType = { PONG: 1, CHANNEL_MESSAGE_WITH_SOURCE: 4 } as const
const EPHEMERAL_FLAG = 1 << 6

function verifyDiscordSignature(publicKeyHex: string, signatureHex: string, timestamp: string, body: string): boolean {
  try {
    const publicKey = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: Buffer.from(publicKeyHex, 'hex').toString('base64url') }, format: 'jwk' })
    return verify(null, Buffer.from(timestamp + body), publicKey, Buffer.from(signatureHex, 'hex'))
  } catch {
    return false
  }
}

// Discord Botのスラッシュコマンド(/tccheck)用Interactions Endpoint。
// Discord公式の要件どおり、リクエストごとにEd25519署名を検証してから応答する。
// https://discord.com/developers/docs/interactions/receiving-and-responding
export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Signature-Ed25519')
  const timestamp = request.headers.get('X-Signature-Timestamp')
  const body = await request.text()

  const publicKeyHex = process.env.DISCORD_PUBLIC_KEY
  if (!publicKeyHex || !signature || !timestamp || !verifyDiscordSignature(publicKeyHex, signature, timestamp, body)) {
    return NextResponse.json({ error: 'invalid request signature' }, { status: 401 })
  }

  const interaction = JSON.parse(body)

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG })
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data?.name === 'tccheck') {
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: await buildUsageMessage(), flags: EPHEMERAL_FLAG },
    })
  }

  return NextResponse.json({ error: 'unknown interaction' }, { status: 400 })
}

async function buildUsageMessage(): Promise<string> {
  const apiToken = process.env.VERCEL_PERSONAL_ACCESS_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  if (!apiToken || !teamId) return 'Vercelの認証情報(VERCEL_PERSONAL_ACCESS_TOKEN / VERCEL_TEAM_ID)が設定されていません。'

  const limitGbEnv = process.env.VERCEL_BLOB_STORAGE_LIMIT_GB
  const limitBytes = limitGbEnv ? Number(limitGbEnv) * 1024 * 1024 * 1024 : undefined

  try {
    const usage = await fetchBlobStorageUsage({ apiToken, teamId, limitBytes })
    const usedGb = usage.usedBytes / 1024 / 1024 / 1024
    const limitGb = usage.limitBytes / 1024 / 1024 / 1024
    return `**Vercel Blob Storage**\n${usedGb.toFixed(2)}GB / ${limitGb.toFixed(2)}GB (${usage.percent.toFixed(1)}%)`
  } catch (error) {
    return `使用量の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
  }
}
