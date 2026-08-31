// 本文(richText)にWYSIWYGで挿入できる主要な要素を詰め込んだテストデータを流し込むスクリプト。
// 開発用DB(.env.localのDATABASE_URL=Neon)にのみ書き込む。対象は既存のテストイベントの本文のみ更新する。
import { fileURLToPath } from 'node:url'
import nextEnv from '@next/env'
import { getPayload } from 'payload'
import config from '../payload.config.ts'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

const { loadEnvConfig } = nextEnv
loadEnvConfig(fileURLToPath(new URL('../', import.meta.url)))

if (process.env.VERCEL) throw new Error('This seed script must not run on Vercel.')

const payload = await getPayload({ config })
const asAdmin = { user: { collection: 'users', role: 'admin' } }

const markdown = `## 開催概要

これはWYSIWYGエディタで挿入できる要素を一通り確認するためのテスト本文です。**太字**や*斜体*、~~取り消し線~~、\`インラインコード\`、[公式サイトへのリンク](https://jp.finalfantasyxiv.com/)なども差し込めます。

> 「灯りを絶やすな、商いは夜も続く」——ルーガンド商会の合言葉。

### 当日の流れ

1. 開場・受付
2. 開会の挨拶
3. 各店舗をめぐるスタンプラリー
4. 抽選会・記念撮影

### 持ち物リスト

- 商会員証(または招待状)
- カメラやスクリーンショット用の準備
- 動きやすい格好

---

詳細は当日会場にて掲示します。ご不明点はお問い合わせまでお気軽にどうぞ。
`

const editorConfig = await editorConfigFactory.default({ config: payload.config })
const body = convertMarkdownToLexical({ editorConfig, markdown })

const results = await payload.find({ collection: 'events', where: { title: { equals: '【テスト】ギャラリー表示確認イベント' } }, limit: 1 })
const target = results.docs[0]
if (!target) throw new Error('対象のテストイベントが見つかりませんでした')

await payload.update({ collection: 'events', id: target.id, data: { body }, ...asAdmin })
// 本文更新でstatusがin_reviewへ戻る仕様(公開中の記事を編集した扱いになるため)なので、確認後の公開まで進める
const published = await payload.update({ collection: 'events', id: target.id, data: { status: 'published' }, ...asAdmin })
console.log('updated body & republished', published.id, published.slug, published.status)

process.exit(0)
