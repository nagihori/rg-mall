import type { Metadata } from 'next'

export const metadata: Metadata = { title: '承認待ち | RG Mall CMS' }

export default function LoginPendingPage() {
  return (
    <main className="container">
      <article className="prose">
        <h1>ログイン申請を受け付けました</h1>
        <p>Discordアカウントの連携は完了しましたが、まだ管理者の承認待ちです。</p>
        <p>権限が付与されると管理画面にログインできるようになります。担当の管理者に連絡してお待ちください。</p>
      </article>
    </main>
  )
}
