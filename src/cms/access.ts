type User = { role?: 'editor' | 'reviewer' | 'admin' } | null | undefined
const roleOf = (req: { user?: User }) => req.user?.role ?? ''
export const isAdmin = ({ req }: any) => roleOf(req) === 'admin'
export const canReview = ({ req }: any) => ['reviewer', 'admin'].includes(roleOf(req))
export const canEdit = ({ req }: any) => ['editor', 'reviewer', 'admin'].includes(roleOf(req))
// メディアの削除は、管理者は全件・編集者/確認者は自分がアップロードしたものだけ。
// uploadedByが無い古いメディアは所有者不明なので管理者のみが消せる。
export const canDeleteOwnMedia = ({ req }: any) => {
  if (isAdmin({ req })) return true
  return canEdit({ req }) && req.user?.id ? { uploadedBy: { equals: req.user.id } } : false
}
// 削除は下書き状態のイベントに限る（管理者も例外なし）。確認待ち以降を消したい場合はまず下書きへ差し戻してから削除する運用にする。
export const canTrashDraft = ({ req }: any) => (canEdit({ req }) ? { status: { equals: 'draft' } } : false)
