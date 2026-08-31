# Game Event CMS Agent Rules

## 最優先事項

1. 更新担当者が、ブラウザだけで安全に告知を更新できること。
2. 公開済みのプレイヤー向け画面に、下書きや不完全な情報を出さないこと。
3. デザインとコンテンツを分離し、コンテンツの更新でレイアウトが壊れないこと。
4. 月額課金なしで運用できる無料枠を前提にし、上限超過で自動課金させないこと。

## 守るべき設計

- CMS の入力を唯一の更新入口とする。公開サイトが CMS へ直接書き込んではならない。
- route / API は認証・入力受理・結果返却に留め、検証、正規化、状態判定は `lib/` に置く。
- DB の値を画面へ直接渡さず、公開用の view model に変換する。
- 表示上の「開催中」「開催予定」「終了」は、本文の表現ではなく開始・終了日時と公開状態から判定する。
- 全日時は UTC で保存し、表示は設定済みタイムゾーンで行う。初期設定は `Asia/Tokyo`。
- 写真は Vercel Blob のメディア ID を参照し、任意の外部画像 URL を本文へ直接埋め込ませない。

## フロントエンド方針

- 表示部品は VamCard の考え方に沿って、カードの責務と画面の責務を分ける。
- 色、余白、文字サイズはトークンから定義する。ページ固有の値を散在させない。
- 公開ページに CMS 管理用の概念や編集状態を露出しない。
- アクセシビリティを優先し、画像には代替テキスト、操作には明確なラベルを用意する。

## データ処理方針

- 入力は CMS の collection hook / service を単一入口として正規化・検証する。
- 状態は `draft`、`in_review`、`published`、`archived` の内部値を使い、UI 上の日本語ラベルとは分ける。
- URL 用 slug、検索用テキスト、表示用日時はサーバー側で生成または検証する。
- 公開・取消・削除・権限変更は監査ログに残す。

## 開発・デプロイ運用

- ブランチと環境の対応、`staging` を経由する開発フローは [`docs/development-deployment.md`](docs/development-deployment.md) を正とする。
- `main` は本番、`staging` は固定 URL の統合・受け入れテスト環境である。これら以外のブランチの Vercel Preview Deployment は個別確認用であり、外部サービスの Redirect URI を必要とする結合テストは `staging` で行う。
- この運用を変更する実装・設定変更では、同文書と Vercel・外部サービスの環境別設定をあわせて確認する。

## 禁止事項

- UI コンポーネント内に公開可否、日時判定、入力検証を重複実装すること。
- 更新担当者に HTML / CSS / Markdown / Git 操作を要求すること。
- 本文の自由入力で、任意スクリプト、iframe、危険なリンクを許可すること。
- 写真の代替テキストや権利情報なしに公開できる設計にすること。
- 公開済みデータを物理削除して履歴を失うこと。原則はアーカイブまたは論理削除とする。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
