import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { renderSimpleMarkdown } from '@/lib/simpleMarkdown'

export const metadata: Metadata = { title: 'プライバシーポリシー' }

export default async function PrivacyPage() {
  const markdown = await readFile(path.join(process.cwd(), 'docs/draft/privacy.md'), 'utf-8')
  return (
    <main className="container">
      <article className="prose">{renderSimpleMarkdown(markdown)}</article>
    </main>
  )
}
