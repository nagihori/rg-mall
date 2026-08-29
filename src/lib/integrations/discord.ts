export async function notifyReviewRequested(input: { eventTitle: string; requester: string; reviewUrl: string; previewUrl: string }) {
  const url = process.env.DISCORD_REVIEW_WEBHOOK_URL
  if (!url) return { delivered: false, reason: 'DISCORD_REVIEW_WEBHOOK_URL is not configured' }
  const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: `確認依頼: **${input.eventTitle}**\n依頼者: ${input.requester}\n確認: ${input.reviewUrl}\nプレビュー: ${input.previewUrl}` }) })
  if (!response.ok) throw new Error(`Discord webhook failed: ${response.status}`)
  return { delivered: true }
}
