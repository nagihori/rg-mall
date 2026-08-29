'use client'

import { useAuth } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// メディア一覧を開いた初期状態では「自分がアップロードしたもの」だけに絞り込む。
// 通常の絞り込みUIと同じwhereクエリを使うので、一覧上部に条件が見え、いつでも解除できる。
export const MediaListDefaultFilter: React.FC = () => {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const hasWhere = [...searchParams.keys()].some((key) => key.startsWith('where'))
    if (hasWhere) return
    const params = new URLSearchParams(searchParams)
    params.set('where[or][0][and][0][uploadedBy][equals]', String(user.id))
    router.replace(`${pathname}?${params.toString()}`)
  }, [user, searchParams, pathname, router])

  return null
}

export default MediaListDefaultFilter
