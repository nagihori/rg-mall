// イベントの「作成者」「確認依頼者」は、保存した時点の名前のコピー(createdByUsername等)を持っている。
// ユーザーのアカウント名を変えたときに、そのユーザーが作成/依頼した記事の表示名もそろえる。
// (監査ログは「操作した時の名前」のまま残すため対象外)
const pairs = [
  ['createdByDiscordId', 'createdByUsername'],
  ['reviewRequestedByDiscordId', 'reviewRequestedByUsername'],
] as const

export async function syncEventUserNames(payload: any, user: { discordId: string; discordUsername: string }) {
  for (const [idField, nameField] of pairs) {
    const { docs } = await payload.find({
      collection: 'events', depth: 0, limit: 0, pagination: false, trash: true, overrideAccess: true, select: { id: true },
      where: { and: [{ [idField]: { equals: user.discordId } }, { [nameField]: { not_equals: user.discordUsername } }] },
    })
    for (const doc of docs) {
      try {
        // 状態遷移のルール(公開中の保存→確認待ちへ戻す等)を発動させないよう、events側のbeforeChangeを素通りさせる印を付ける。
        // 1件の失敗(必須項目が足りない古い下書きなど)で他の記事の更新を止めないよう、記事ごとに分けて実行する。
        await payload.update({ collection: 'events', id: doc.id, data: { [nameField]: user.discordUsername }, overrideAccess: true, trash: true, context: { skipEventWorkflow: true } })
      } catch (err) {
        payload.logger.error({ err, eventId: doc.id }, '記事の作成者/確認依頼者名の更新に失敗しました')
      }
    }
  }
}
