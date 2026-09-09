import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "tagline" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_image_id" integer;
  DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_header_image_id_media_id_fk" FOREIGN KEY ("header_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_footer_image_id_media_id_fk" FOREIGN KEY ("footer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "site_settings_header_image_idx" ON "site_settings" USING btree ("header_image_id");
  CREATE INDEX IF NOT EXISTS "site_settings_footer_image_idx" ON "site_settings" USING btree ("footer_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_header_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_footer_image_id_media_id_fk";
  
  DROP INDEX "site_settings_header_image_idx";
  DROP INDEX "site_settings_footer_image_idx";
  ALTER TABLE "site_settings" DROP COLUMN "header_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "tagline";
  ALTER TABLE "site_settings" DROP COLUMN "footer_image_id";`)
}
