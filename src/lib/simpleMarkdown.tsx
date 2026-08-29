import { Fragment } from 'react'

// h1/h2見出し・段落・箇条書きのみを想定した最小限のMarkdown→JSX変換
export function renderSimpleMarkdown(markdown: string) {
  const lines = markdown.trim().split('\n')
  const blocks: React.ReactNode[] = []
  let listItems: string[] = []
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push(
      <ul key={key++}>
        {listItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>,
    )
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === '') {
      flushList()
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      blocks.push(<h2 key={key++}>{line.slice(3)}</h2>)
    } else if (line.startsWith('# ')) {
      flushList()
      blocks.push(<h1 key={key++}>{line.slice(2)}</h1>)
    } else if (line.startsWith('- ')) {
      listItems.push(line.slice(2))
    } else {
      flushList()
      blocks.push(<p key={key++}>{line}</p>)
    }
  }
  flushList()

  return <Fragment>{blocks}</Fragment>
}
