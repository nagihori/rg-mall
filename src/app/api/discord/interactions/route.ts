import { createPublicKey, verify } from 'node:crypto'
import { NextRequest, NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { fetchBlobStorageUsage } from '../../../../lib/integrations/vercelUsage'

const InteractionType = { PING: 1, APPLICATION_COMMAND: 2 } as const
const InteractionResponseType = { PONG: 1, CHANNEL_MESSAGE_WITH_SOURCE: 4, DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5 } as const
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

  if (interaction.type === InteractionType.APPLICATION_COMMAND && interaction.data?.name === 'newevent') {
    // payload.createはDBコールドスタート込みでDiscordの3秒応答制限を超えることがあるため、
    // 先にDEFERRED応答で確保しておき、本処理はafter()でレスポンス返却後に実行してフォローアップメッセージを編集する。
    after(() => createDraftEvent(interaction))
    return NextResponse.json({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      data: { flags: EPHEMERAL_FLAG },
    })
  }

  return NextResponse.json({ error: 'unknown interaction' }, { status: 400 })
}

async function editFollowupMessage(interaction: any, content: string) {
  const url = `https://discord.com/api/v10/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`
  await fetch(url, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

// サーバー内での実行(interaction.member)・DMでの実行(interaction.user)の両方をサポートする。
async function createDraftEvent(interaction: any): Promise<void> {
  const title = String(interaction.data?.options?.find((opt: any) => opt.name === 'title')?.value ?? '').trim()
  if (!title) {
    await editFollowupMessage(interaction, 'イベント名を指定してください。')
    return
  }

  const discordUser = interaction.member?.user ?? interaction.user

  try {
    const payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'events',
      data: { title, summary: `「${title}」の下書きがDiscordから作成されました`, createdByDiscordId: discordUser?.id, createdByUsername: discordUser?.username },
      draft: true,
      overrideAccess: true,
    })
    const editUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/collections/events/${doc.id}`
    await editFollowupMessage(interaction, `✅ 「${doc.title}」を下書きとして作成しました\n${editUrl}`)
  } catch (error) {
    await editFollowupMessage(interaction, `イベントの作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`)
  }
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
