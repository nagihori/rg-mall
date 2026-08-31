# 開発・デプロイ運用（α版以降）

この文書は、rg-mall のコード変更を統合し、Vercel へデプロイする際の共通運用である。ブランチ名の分類と環境の対応は、ここに記載したものを正とする。

## ブランチと環境

| ブランチ | 用途 | Vercel の扱い |
| --- | --- | --- |
| `main` | 本番環境 | Production Deployment |
| `staging` | 統合・受け入れテスト環境 | 固定 URL の Preview Deployment |
| `main` / `staging` 以外 | 開発中の作業 | ブランチごとの Preview Deployment。個別の動作確認を補助する用途 |

- 開発中ブランチの命名規則は設けない。
- ブランチごとの Vercel Preview Deployment は、統合テスト環境の代替ではない。
- `staging` の固定 URL は Vercel の設定で維持し、変更する場合は Discord OAuth を含む外部サービスの設定を先に更新する。

## 開発フロー

原則は次の順序とする。

1. `main` または `staging` から開発ブランチを作成して変更する。
2. 必要に応じて、そのブランチの Vercel Preview Deployment で個別に動作確認する。
3. `staging` へ反映し、固定 URL で統合・受け入れテストを行う。
4. 問題がなければ `staging` の内容を `main` へ反映する。

緊急修正でも、可能な限り `staging` で確認してから `main` へ反映する。確認を省略した場合は、理由と確認結果を変更記録に残す。

## 外部サービスと環境変数

- Discord OAuth など、Redirect URI を登録する外部サービスの結合テストは `staging` で行う。開発ブランチごとの一時 URL を Redirect URI を要するテストの標準環境にしない。
- `DISCORD_REDIRECT_URI` と `NEXT_PUBLIC_APP_URL` は、環境ごとにその環境の URL と一致させる。`staging` では固定 staging URL、本番では本番 URL を設定する。
- `DISCORD_CLIENT_SECRET`、DB 接続情報、Webhook URL、Blob トークンなどの秘密値は、環境別に Vercel Environment Variables で管理し、Git に保存しない。
- 本番データを `staging` で編集しない。検証に必要なデータと外部サービスの接続先は、本番と分離する。

## リリース確認

- `staging` では、通常の画面・CMS 操作に加え、Discord OAuth のログインと Redirect URI を使う処理を確認する。
- `main` への反映後は Production Deployment の URL で基本導線を確認する。
- デプロイ失敗、外部サービスの設定変更、固定 staging URL の変更は、復旧または設定整合を確認してから次の環境へ進める。
