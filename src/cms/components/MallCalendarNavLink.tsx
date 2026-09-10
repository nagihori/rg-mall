'use client'

import Link from 'next/link'
import { useConfig } from '@payloadcms/ui'

// afterNavLinksに差し込むだけの単純なリンク。カスタムビュー(MallCalendarAdminView)への導線。
export const MallCalendarNavLink: React.FC = () => {
  const { config: { routes: { admin } } } = useConfig()
  return (
    <div className="mall-calendar-nav-link">
      <Link href={`${admin}/mall-calendar`}>商店街カレンダー</Link>
    </div>
  )
}

export default MallCalendarNavLink
