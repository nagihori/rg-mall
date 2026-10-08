import { describe, expect, it } from 'vitest'
import { internalDocToHref } from './richTextLink'

const link = (doc: unknown) => ({ linkNode: { fields: { doc } } })

describe('internalDocToHref', () => {
  it('イベントとストアを公開URLへ変換する', () => {
    expect(internalDocToHref(link({ relationTo: 'events', value: { id: 1, slug: 'summer' } }))).toBe('/events/summer')
    expect(internalDocToHref(link({ relationTo: 'stores', value: { id: 2, slug: 'shop-a' } }))).toBe('/stores/shop-a')
  })
  it('解決できないものは # にする', () => {
    expect(internalDocToHref(link({ relationTo: 'events', value: 1 }))).toBe('#')
    expect(internalDocToHref(link({ relationTo: 'media', value: { slug: 'x' } }))).toBe('#')
    expect(internalDocToHref(link(undefined))).toBe('#')
  })
})
