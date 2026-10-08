import { LinkJSXConverter } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

// 本文の内部リンク（リンク先ドキュメント参照）を公開サイトのURLへ変換する。
// 変換先が決まらないものは '#' のままにする（存在しないページへ飛ばさない）。
const COLLECTION_PATHS: Record<string, string> = { events: '/events', stores: '/stores' }

type InternalLinkFields = { doc?: { relationTo?: string; value?: unknown } | null }

export function internalDocToHref({ linkNode }: { linkNode: { fields: unknown } }): string {
  const doc = (linkNode.fields as InternalLinkFields).doc
  const base = doc?.relationTo ? COLLECTION_PATHS[doc.relationTo] : undefined
  const value = doc?.value
  // depth>=1 で取得するとドキュメントそのものが入る。slug が無い（ID のみ等）場合は解決できない
  const slug = value && typeof value === 'object' ? (value as { slug?: unknown }).slug : undefined
  if (!base || typeof slug !== 'string' || slug === '') return '#'
  // slug は保存時にURL用へ正規化済み。他の href と同様そのまま連結する（再エンコードすると二重になる）
  return `${base}/${slug}`
}

export const richTextConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
})
