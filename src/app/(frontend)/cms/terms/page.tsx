import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { renderSimpleMarkdown } from '@/lib/simpleMarkdown'

export const metadata: Metadata = { title: '利用規約' }

export default async function TermsPage() {
  const markdown = await readFile(path.join(process.cwd(), 'docs/draft/terms.md'), 'utf-8')
  return (
    <main className="container">
      <article className="prose">{renderSimpleMarkdown(markdown)}</article>
    </main>
  )
}
