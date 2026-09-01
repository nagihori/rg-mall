async function sendReviewWebhook(content: string) {
  const url = process.env.DISCORD_REVIEW_WEBHOOK_URL
  // Preview/DevelopmentではWebhook未設定を想定し、本番Discordチャンネルを汚さずコンソールに書き出すだけにする。
  if (!url) {
    console.info(`[Discord通知(コンソール出力): DISCORD_REVIEW_WEBHOOK_URL未設定のため送信をスキップ]\n${content}`)
    return { delivered: false, reason: 'DISCORD_REVIEW_WEBHOOK_URL is not configured' }
  }
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content }) })
  if (!response.ok) throw new Error(`Discord webhook failed: ${response.status}`)
  return { delivered: true }
}

export async function notifyApprovalNeeded(input: { discordUsername: string; userId: number | string; adminDiscordIds: string[] }) {
  if (input.adminDiscordIds.length === 0) {
    console.warn('[Discord通知: 承認可能なadminユーザーが存在しないため、メンション無しで送信します]')
  }
  const mentions = input.adminDiscordIds.map((id) => `<@${id}>`).join(' ')
  const usersUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/collections/users/${input.userId}`
  return sendReviewWebhook(`
      ### 🔔 新規ログイン申請があります ${mentions}
      > **[${input.discordUsername}](${usersUrl})** さんが承認待ちです。管理画面から権限を割り当ててください。
    `)
}

export async function notifyUserApproved(input: { discordUsername: string; discordId: string }) {
  const mention = `<@${input.discordId}>`
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/login`
  return sendReviewWebhook(`
      ### ✅ ${mention} 管理画面に入れるようになりました
      > もう一度 [こちらからログイン](${loginUrl}) してください
    `)
}

export async function notifyReviewRequested(input: { eventTitle: string; requester: string; reviewUrl: string; previewUrl: string }) {
  const reviewerRoleId = process.env.DISCORD_REVIEWER_ROLE_ID
  const mention = reviewerRoleId ? `<@&${reviewerRoleId}> ` : ''
  return sendReviewWebhook(`
      ### ✅ ${input.requester} から確認依頼が届いています ${mention}
      > **「[${input.eventTitle}](${input.reviewUrl})」** ([プレビュー](${input.previewUrl}))
    `)
}

export async function notifyReturnedToDraft(input: { eventTitle: string; reviewer: string; editUrl: string; authorDiscordId?: string | null }) {
  const mention = input.authorDiscordId ? `<@${input.authorDiscordId}> ` : ''
  return sendReviewWebhook(`
      ### 🔔 確認依頼したイベントが${input.reviewer}に差し戻しされました ${mention}
      > **「[${input.eventTitle}](${input.editUrl})」** から再編集してください
    `)
}

export async function notifyPublished(input: { eventTitle: string; summary: string; requester: string; publicUrl: string }) {
  return sendReviewWebhook(`
      @here\n### 🎉 ${input.requester}が書いたイベント 「[**${input.eventTitle}**](${input.publicUrl})」 が公開されました
      > ${input.summary}
    `)
}

export async function notifyArchived(input: { eventTitle: string; actor: string }) {
  return sendReviewWebhook(`アーカイブ: **${input.eventTitle}**\n実行者: ${input.actor}`)
}

export async function notifyVercelUsageThreshold(input: { resource: string; percent: number; usedGb: number; limitGb: number }) {
  return sendReviewWebhook(`
      @here\n### ⚠️ ${input.resource}の使用量が無料枠の${Math.round(input.percent)}%を超えました
      > ${input.usedGb.toFixed(2)}GB / ${input.limitGb.toFixed(2)}GB
    `)
}
