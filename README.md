# Game Event CMS

ゲーム内で定期開催するイベントの告知と、その終了後のアーカイブを運用する CMS である。

更新担当者はブラウザで「お知らせを書く・写真を選ぶ・公開する」だけを行い、画面デザイン、項目設計、権限、配信の保守は Git とコードを扱える管理者が担う。

## 目的

- 告知を、専門知識がない複数の更新担当者でも迷わず公開できるようにする。
- 開催中・開催予定・終了済みのイベントを、日時にもとづいて正しく見せる。
- 過去の告知と写真を、プレイヤーが後から探せる形で残す。

## 最優先の体験

更新担当者が、公開中のページを壊したり HTML を理解したりせず、1 件のイベント告知を作成・見直し・公開できること。

公開画面では、いま参加できるイベントを最初に見つけられることを優先する。

## 想定利用者

- 更新担当者: イベント告知の本文・写真・開催日時をブラウザから入力する複数人。
- 確認者: 下書きを確認し、公開の最終判断をする人。
- プレイヤー: 告知を閲覧し、現在／今後のイベントとアーカイブを探す人。
- 開発・運用管理者: Git とコードでデザイン、CMS の項目、権限、配信を保守する人。

## 採用方針

初期実装は **Next.js + TypeScript + Payload CMS + Supabase PostgreSQL（無料枠）+ Vercel Blob** を想定する。

- Payload の管理画面を、更新担当者のブラウザ編集画面にする。
- コンテンツ定義と公開画面はアプリのコードとして Git 管理する。
- 写真は DB に埋め込まず、Vercel Blob に保存する。Vercel Blob は S3 を基盤にするサービスだが、アプリでは S3 互換 API ではなく `@vercel/blob` を利用する。
- 公開画面は CMS の公開済みデータだけを読み、下書きは表示しない。
- 更新担当者は Discord OAuth でログインし、確認依頼は Discord の専用チャンネルへ通知する。公開・差し戻しは CMS 上で行い、監査ログを確実に残す。

## 費用とホスティングの制約

- **月額課金ゼロ**を強い制約とし、Vercel Hobby、Supabase Free、Vercel Blob の無料利用枠、Discord の無料機能だけで運用する。
- 無料枠の超過時は自動課金に移行せず、公開・アップロードを停止または縮退させ、管理者へ通知する。利用量を毎月確認する。
- Vercel Hobby は個人・非商用利用に限定される。商用のゲーム告知である場合、この無料運用案は Vercel の利用条件に適合しないため、ホスティング方針を再決定する。
- 本番 URL は `https://rg-mall.vercel.app` を希望名とする。`.vercel.app` は先着順で予約できないため、Vercel プロジェクト作成時に確保できた場合だけ採用し、取得できなければ別名を決める。

この選択は、複数ユーザー、役割分担、写真アップロード、コードによる保守を一つの構成で満たすための初期案である。ホスティングや組織の既存契約により、同等の権限・下書き・メディア機能を満たす別 CMS に置き換える場合も、`SPEC.md` のデータモデルと運用ルールを維持する。

## 非目標

- プレイヤーのアカウント、コメント、いいね、投稿機能
- 任意レイアウトを作れるページビルダー
- イベント申込・課金・ゲームデータとのリアルタイム連携
- 多言語、予約投稿、高度な検索は v1 の必須要件にしない

## UI 方針

- 公開画面はスマートフォンを優先し、PC でも読みやすくする。
- CMS の編集画面は「イベント情報」「本文」「写真」「公開」の順で上から入力できる構成にする。
- 更新担当者に Markdown、HTML、画像 URL、スラッグの入力を求めない。
- 必須項目には日本語の短い説明と入力例を付け、エラーは該当欄の直下に表示する。
- 公開前に、カード表示と詳細表示のプレビューを確認できるようにする。

## 文書

- `SPEC.md`: 要件、データモデル、入力・表示・検証ルール
- `ROADMAP.md`: 段階的な実装範囲
- `docs/architecture.md`: 責務、データフロー、保存・公開方針
- `docs/editor-guide.md`: 更新担当者向けの操作ルール
- `docs/adr/001-cms-selection.md`: CMS 選定の判断記録

## 開発開始時の確認事項

実装前に、以下だけは運用責任者と確定する。

1. 公開の最終承認者と、誤公開時の連絡先
2. イベントの標準タイムゾーン（初期値は `Asia/Tokyo`）
3. 写真の権利確認と保持期限
4. ホスティング先、ログイン方式、バックアップの保管先
5. 非商用運用であること、および各無料枠の利用上限・超過時の停止判断

## ローカル開発

Node.js 20 以上を使い、依存関係を入れてから環境変数を設定する。

```bash
cp .env.example .env.local
npm install
npm run dev
```

`DATABASE_URL` はアプリ実行用の Supabase Shared Pooler **transaction mode（6543）** 接続文字列にする。`DATABASE_ADMIN_URL` は migration・バックアップ専用の Supabase Shared Pooler **session mode（5432）** 接続文字列にし、Vercel には設定しない。direct connection は使用しない。

Payload 3 の Postgres adapter は通常実行時に常に `DATABASE_URL` を読む。

```bash
npm run payload:migrate:create # migration ファイルを作るだけ（DATABASE_ADMIN_URL は不要）
npm run payload:migrate
```

`payload:migrate:create` は migration ファイルを作るだけで、`DATABASE_ADMIN_URL` を要求しない。`payload:migrate` は `DATABASE_ADMIN_URL` を使って既存 migration を本番 DB に適用する専用コマンドであり、Vercel build には含めずローカル管理環境からのみ実行する。この script は `DATABASE_ADMIN_URL` が未設定なら失敗し、Vercel 上では実行を拒否する。`DATABASE_ADMIN_URL` を Vercel に設定したり、通常の `dev` / `build` / `start` の `DATABASE_URL` として使ったりしてはならない。

本番環境に必要な値は `DATABASE_URL`、`PAYLOAD_SECRET`、`NEXT_PUBLIC_APP_URL`、`BLOB_READ_WRITE_TOKEN`、`DISCORD_CLIENT_ID`、`DISCORD_CLIENT_SECRET`、`DISCORD_REDIRECT_URI`、`DISCORD_REVIEW_WEBHOOK_URL`である。`DISCORD_REVIEWER_ROLE_ID`（確認依頼通知でのロールメンション用）は省略可。秘密値は `.env.local` と Vercel Environment Variables のみに置き、Git に追加しない。

## 外部サービスの設定

- **Supabase**: Free プロジェクトを作成し、アプリには Shared Pooler transaction mode（6543）の URL を設定する。migration/バックアップはローカル管理環境で Shared Pooler session mode（5432）の `DATABASE_ADMIN_URL` を使う。direct connection は使用しない。休止後は最初のリクエストを再試行し、失敗時は「データベースの復帰を待ってから再試行してください」と CMS に案内する。無料枠維持のための定期アクセスは行わない。
- **Vercel Blob**: public store を作成し `BLOB_READ_WRITE_TOKEN` を設定する。画像は `@vercel/blob` の adapter 経由だけで扱う。利用量が上限に近い場合は新規アップロードを停止し、既存の公開ページ配信を優先する。
- **Discord**: OAuth アプリの redirect URL を `DISCORD_REDIRECT_URI` に合わせ、scope は `identify` のみを要求する。Discord ID と CMS role は `users` collection で対応付ける。Incoming Webhook は確認依頼・公開結果の通知専用で、Discord から公開状態を変更しない。
- **Vercel**: Hobby は個人・非商用利用に限る。すべてのサービスで無料枠超過時の自動課金を無効にしてからデプロイする。希望 URL `https://rg-mall.vercel.app` はデプロイ作成時に利用可能な場合だけ設定する。

## 検証

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

ユニットテストは状態遷移、日時分類、入力検証、正規化、公開 presenter を対象にする。公開ページは `published` または公開済み `archived` だけを repository 層で読み、CMS の下書き・確認待ちは取得しない。
