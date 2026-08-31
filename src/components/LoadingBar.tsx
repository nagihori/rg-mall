// Suspense/loading.tsx のフォールバックとして表示する、画面最上部の細いローディングバー。
// DBを待つ間ページ全体を白紙にしないためのもの。
export function LoadingBar() {
  return (
    <div className="loading-bar" role="status" aria-label="読み込み中">
      <span className="loading-bar-fill" />
    </div>
  )
}
