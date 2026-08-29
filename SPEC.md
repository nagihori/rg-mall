# Game Event CMS Specification

## 目的と優先順位

1. 更新担当者が安全に作成・確認・公開できる。
2. プレイヤーが開催中／予定のイベントをすぐ理解できる。
3. 終了イベントを読み返せるアーカイブを保つ。
4. 開発者がコードで見た目と運用ルールを変更できる。

## データモデル

```ts
type EventStatus = 'draft' | 'in_review' | 'published' | 'archived'

type Event = {
  id: string
  title: string
  slug: string
  summary: string
  body: RichTextDocument
  heroImageId: string | null
  galleryImageIds: string[]
  startsAt: string | null // ISO 8601 UTC
  endsAt: string | null   // ISO 8601 UTC
  status: EventStatus
  publishedAt: string | null
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

type Media = {
  id: string
  storageKey: string
  alt: string
  credit: string | null
  rightsNote: string
  width: number
  height: number
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  createdBy: string
  createdAt: string
}

type UserRole = 'editor' | 'reviewer' | 'admin'
```

`RichTextDocument` は CMS が許可した見出し、段落、箇条書き、リンク、画像だけで構成する。生 HTML、script、iframe は許可しない。

## 権限と状態遷移

| 役割 | できること |
| --- | --- |
| editor | 下書きの作成・編集、写真の追加、確認依頼 |
| reviewer | editor の権限に加え、確認依頼された告知の公開・差し戻し |
| admin | 全コンテンツ・ユーザー・CMS 設定の管理 |

状態遷移は `draft → in_review → published → archived` を基本とする。reviewer と admin は `in_review → draft` の差し戻しを行える。公開後の編集は新しい下書きとして保存し、再公開まで公開中の内容を維持する。

## 入力仕様と正規化

| 項目 | 入力 | 保存・正規化 |
| --- | --- | --- |
| タイトル | 必須、1〜80 文字 | 前後空白を除去。slug はタイトルから生成し重複時は連番 |
| 概要 | 必須、20〜160 文字 | カード・SNS用。改行を空白に正規化 |
| 本文 | 必須 | 許可ブロックだけを保存。リンクは `https` を原則とする |
| メイン写真 | 任意 | 選択時は alt、権利メモを必須にする |
| 開始・終了 | 任意、両方入力を推奨 | 入力タイムゾーンを UTC に変換。終了は開始以後 |
| 公開日時 | reviewer が公開時に確定 | サーバー時刻を UTC で保存 |

イベント期間が未定の場合、更新担当者は日時欄を空にして「期間未定」の定型表示を選べる。本文へ曖昧な日付だけを書く運用にはしない。

## バリデーション

- `title`、`summary`、`body` は公開・確認依頼時に必須。
- `startsAt` と `endsAt` は片方だけの入力を警告し、公開には両方または両方未入力を要求する。
- `endsAt` は `startsAt` より後でなければならない。
- 写真ファイルは JPEG / PNG / WebP、初期上限 10 MB。アップロード時に表示用の派生画像を生成する。
- 画像を掲載する場合は alt と rightsNote を必須にする。装飾目的で意味を持たない画像だけは alt を空にできる。
- 削除ではなく `archived` を原則とする。完全削除は admin のみが行い、監査ログを残す。

## 表示仕様

公開サイトは `published` のイベントだけを表示する。現在時刻と開催日時で以下の表示カテゴリを作る。

| カテゴリ | 条件 | 表示場所 |
| --- | --- | --- |
| 開催中 | 開始 <= 現在 < 終了 | トップの最優先枠 |
| 開催予定 | 現在 < 開始 | トップの次枠、開始日時順 |
| お知らせ | 期間未定、または期間外で公開から30日以内 | 新着一覧、公開日時順 |
| アーカイブ | 終了 <= 現在、または公開から31日以上 | アーカイブ、終了日時の新しい順 |

`archived` は公開サイトのアーカイブとして閲覧可能にし、管理画面では終了・保管済みとして扱う。公開を取り消す必要がある場合は `published` から非公開状態へ戻す専用操作を用意し、理由を記録する。

## 画面と操作

- 公開トップ: 開催中、開催予定、新着、アーカイブへの導線。
- イベント詳細: タイトル、期間、本文、写真、前後のイベントへの導線。
- アーカイブ: 年月または年で絞り込み、カード一覧を表示。
- CMS 一覧: 状態・更新者・最終更新日時を確認し、下書きと確認待ちを優先表示。
- CMS 編集: 入力順に並ぶ一画面フォーム。保存、確認依頼、プレビューを明確に分ける。

## 非機能要件

- 管理画面は最新の Chrome、Safari、Edge で利用できること。
- 公開ページは画像最適化、キャッシュ無効化または再検証で、公開後おおむね5分以内に反映すること。
- DB の日次バックアップと、メディアの世代管理を行うこと。
- 公開・非公開・削除・権限変更の監査ログを最低1年保存すること。
- 本番・検証環境を分け、本番データを検証環境で編集しないこと。

