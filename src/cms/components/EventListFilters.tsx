'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// 一覧上部の絞り込みUI。
// - 「自分の記事のみ表示」⇔「全ての記事を表示」の切り替えボタン
// - 作成者・確認依頼者のプルダウン絞り込み(DiscordIDではなく表示名で選べるようにする)
// 通常の「Filters」ポップアップと同じwhereクエリ(URL)を使うので、選択状態はURLに残り共有もできる。
// ここで組み立てるwhereは自分たちの3条件だけを対象にする単純な実装のため、Filtersポップアップ側で
// 別途複雑な条件を組んでいる場合はこのUIの操作で上書きされる。
const MINE_KEY = 'where[or][0][and][0][createdByDiscordId][equals]'
const AUTHOR_KEY = 'where[or][0][and][1][createdByUsername][equals]'
const REQUESTER_KEY = 'where[or][0][and][2][reviewRequestedByUsername][equals]'

export const EventListFilters: React.FC = () => {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [authors, setAuthors] = useState<string[]>([])
  const [requesters, setRequesters] = useState<string[]>([])

  const mineOnly = searchParams.get(MINE_KEY) === String((user as { discordId?: string } | null)?.discordId)
  const authorValue = searchParams.get(AUTHOR_KEY) ?? ''
  const requesterValue = searchParams.get(REQUESTER_KEY) ?? ''

  useEffect(() => {
    let cancelled = false
    fetch('/api/events?limit=200&depth=0&select[createdByUsername]=true&select[reviewRequestedByUsername]=true', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled || !json?.docs) return
        const uniqueSorted = (values: (string | undefined)[]) => [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'ja'))
        setAuthors(uniqueSorted(json.docs.map((doc: { createdByUsername?: string }) => doc.createdByUsername)))
        setRequesters(uniqueSorted(json.docs.map((doc: { reviewRequestedByUsername?: string }) => doc.reviewRequestedByUsername)))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const applyFilters = (next: { mineOnly: boolean; author: string; requester: string }) => {
    const params = new URLSearchParams(searchParams)
    params.delete(MINE_KEY); params.delete(AUTHOR_KEY); params.delete(REQUESTER_KEY)
    const discordId = (user as { discordId?: string } | null)?.discordId
    if (next.mineOnly && discordId) params.set(MINE_KEY, discordId)
    if (next.author) params.set(AUTHOR_KEY, next.author)
    if (next.requester) params.set(REQUESTER_KEY, next.requester)
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="event-list-filters">
      <button
        type="button"
        className="event-list-filters__toggle"
        onClick={() => applyFilters({ mineOnly: !mineOnly, author: authorValue, requester: requesterValue })}
      >
        {mineOnly ? '全ての記事を表示' : '自分の記事のみ表示'}
      </button>
      <label className="event-list-filters__select">
        作成者
        <select value={authorValue} onChange={(e) => applyFilters({ mineOnly, author: e.target.value, requester: requesterValue })}>
          <option value="">すべて</option>
          {authors.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label className="event-list-filters__select">
        確認依頼者
        <select value={requesterValue} onChange={(e) => applyFilters({ mineOnly, author: authorValue, requester: e.target.value })}>
          <option value="">すべて</option>
          {requesters.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
    </div>
  )
}

export default EventListFilters
