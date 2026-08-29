type User = { role?: 'editor' | 'reviewer' | 'admin' } | null | undefined
const roleOf = (req: { user?: User }) => req.user?.role ?? ''
export const isAdmin = ({ req }: any) => roleOf(req) === 'admin'
export const canReview = ({ req }: any) => ['reviewer', 'admin'].includes(roleOf(req))
export const canEdit = ({ req }: any) => ['editor', 'reviewer', 'admin'].includes(roleOf(req))
// 管理者はいつでも削除（ゴミ箱行き）できる。編集者・確認者は下書きのみ、うっかり量産した草稿を自分で片付けられるようにする。
export const canTrashDraft = ({ req }: any) => (roleOf(req) === 'admin' ? true : canEdit({ req }) ? { status: { equals: 'draft' } } : false)
