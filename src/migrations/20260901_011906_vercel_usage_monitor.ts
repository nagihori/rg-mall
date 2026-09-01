import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// 手書きmigration: `payload migrate:create`は過去のmedia関連の手書きmigration
// (20260829_135500_media_rights_uploader / 20260829_141200_media_drop_storage_key)
// が.jsonスナップショットを更新していないため、無関係なmediaテーブルの差分
// (uploaded_by_idの作成/リネーム判定)を対話的に聞いてくる状態になっている。
// 今回はvercelUsageMonitor globalの追加のみなので、既存の手書きmigrationと
// 同じ流儀でテーブル作成SQLを直接書く。
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "vercel_usage_monitor" (
    "id" serial PRIMARY KEY NOT NULL,
    "period_key" varchar,
    "notified_threshold" numeric DEFAULT 0,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone
   );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "vercel_usage_monitor";`)
}
