type User = { role?: 'editor' | 'reviewer' | 'admin' } | null | undefined
const roleOf = (req: { user?: User }) => req.user?.role ?? ''
export const isAdmin = ({ req }: any) => roleOf(req) === 'admin'
export const canReview = ({ req }: any) => ['reviewer', 'admin'].includes(roleOf(req))
export const canEdit = ({ req }: any) => ['editor', 'reviewer', 'admin'].includes(roleOf(req))
