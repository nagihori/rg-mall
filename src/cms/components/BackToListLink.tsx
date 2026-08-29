'use client'

import Link from 'next/link'
import { useConfig, useDocumentInfo } from '@payloadcms/ui'

// 作成・編集画面から一覧へワンクリックで戻れるようにするだけのリンク。
// DocumentControls内に差し込んだ上で、CSSでタイトル行の左端に見えるよう配置する。
export const BackToListLink: React.FC = () => {
  const { collectionSlug } = useDocumentInfo()
  const { config: { routes: { admin } } } = useConfig()

  return (
    <Link href={`${admin}/collections/${collectionSlug}`} className="back-to-list-link" title="一覧へ戻る">
      «
    </Link>
  )
}

export default BackToListLink
