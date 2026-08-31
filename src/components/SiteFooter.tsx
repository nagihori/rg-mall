import Image from 'next/image'

// TODO: サーバー名・集合場所・連絡先は仮テキスト。実データが決まり次第差し替える。
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Image src="/images/hero.png" alt="" fill sizes="100vw" className="site-footer-bg" />
      <div className="site-footer-overlay" />
      <div className="site-footer-content container">
        <p className="site-footer-brand">ルーガンド商会 商店街</p>
        <a href="https://jp.finalfantasyxiv.com/lodestone/community_finder/5d615327600055511e43ecc06a75388b1b530ae2/" target="_blank" rel="noreferrer" className="site-footer-link">
          FINAL FANTASY XIV ルーガンド商会 追加メンバー募集中 <span aria-hidden="true">↗</span>
        </a>
        <dl className="site-footer-info">
          <div>
            <dt>サーバー</dt>
            <dd>Zeromus @ Meteor DC</dd>
          </div>
          <div>
            <dt>所在地</dt>
            <dd>ゴブレットビュート 18区45番地</dd>
          </div>
          <div>
            <dt>お問い合わせ</dt>
            <dd>商会長・Dudek Rugand</dd>
          </div>
        </dl>
      </div>
    </footer>
  )
}
