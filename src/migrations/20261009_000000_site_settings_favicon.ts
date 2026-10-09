import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// 開発・staging(Neon)ではdevモードの自動スキーマ反映で先にカラムができていることがあるため、
// 既にあっても失敗しないよう冪等に書く(本番では通常どおり新規作成される)。
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "favicon_id" integer;
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_favicon_id_media_id_fk') THEN
      ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;
  CREATE INDEX IF NOT EXISTS "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_favicon_id_media_id_fk";
  
  DROP INDEX IF EXISTS "site_settings_favicon_idx";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "favicon_id";`)
}
