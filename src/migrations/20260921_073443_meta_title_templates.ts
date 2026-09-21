import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "home_title_template" varchar DEFAULT 'イベントのお知らせ « {{site_title}}';
  ALTER TABLE "site_settings" ADD COLUMN "event_title_template" varchar DEFAULT '{{event_title}} « {{site_title}}';
  ALTER TABLE "site_settings" ADD COLUMN "store_title_template" varchar DEFAULT '{{store_title}} « {{site_title}}';
  ALTER TABLE "site_settings" ADD COLUMN "site_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "home_title_template";
  ALTER TABLE "site_settings" DROP COLUMN "event_title_template";
  ALTER TABLE "site_settings" DROP COLUMN "store_title_template";
  ALTER TABLE "site_settings" DROP COLUMN "site_description";`)
}
