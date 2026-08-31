import Link from 'next/link'

// 詳細ページ・アーカイブページなど、トップから外れた場所に置く戻り導線の帯。
export function BackToTopBar() {
  return (
    <div className="back-to-top-bar">
      <Link href="/" className="back-to-top-link">« トップページへ戻る</Link>
    </div>
  )
}
