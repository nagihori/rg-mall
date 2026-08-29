type AuditAction = 'published' | 'unpublished' | 'archived' | 'deleted' | 'role_changed' | 'returned_to_draft'
export async function recordEventTransition(req: any, event: string | number, action: AuditAction, reason?: string) {
  await req.payload.create({ collection: 'auditLogs', data: { event, actor: req.user?.id, action, reason }, overrideAccess: true })
}
export async function recordRoleChange(req: any, targetUser: string | number) {
  await req.payload.create({ collection: 'auditLogs', data: { targetUser, actor: req.user?.id, action: 'role_changed' }, overrideAccess: true })
}
