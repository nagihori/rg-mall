import { describe, expect, it } from 'vitest'
import { partitionFcEventsByEnded, sortFcEventsByDate } from './fcEvent'

describe('sortFcEventsByDate', () => {
  it('日付の古い順に並べる', () => {
    const sorted = sortFcEventsByDate([
      { date: '2026-10-05T00:00:00.000Z', title: 'c' },
      { date: '2026-09-25T00:00:00.000Z', title: 'a' },
      { date: '2026-09-30T00:00:00.000Z', title: 'b' },
    ])
    expect(sorted.map((e) => e.title)).toEqual(['a', 'b', 'c'])
  })
})

describe('partitionFcEventsByEnded', () => {
  it('前日までを終了済み、当日以降を残す(JST基準)', () => {
    const now = new Date('2026-09-21T09:00:00.000Z') // JST 9/21 18:00
    const { active, ended } = partitionFcEventsByEnded(
      [{ date: '2026-09-19T15:00:00.000Z' }, { date: '2026-09-21T00:00:00.000Z' }, { date: '2026-09-25T00:00:00.000Z' }],
      now,
    )
    expect(ended).toHaveLength(1)
    expect(active).toHaveLength(2)
  })
})
