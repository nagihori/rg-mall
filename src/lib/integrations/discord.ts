async function sendReviewWebhook(content: string) {
  const url = process.env.DISCORD_REVIEW_WEBHOOK_URL
  if (!url) return { delivered: false, reason: 'DISCORD_REVIEW_WEBHOOK_URL is not configured' }
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content }) })
  if (!response.ok) throw new Error(`Discord webhook failed: ${response.status}`)
  return { delivered: true }
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
