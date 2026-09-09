import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "show_on_mall_calendar" boolean DEFAULT false;
  ALTER TABLE "_events_v" ADD COLUMN "version_show_on_mall_calendar" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN "show_on_mall_calendar";
  ALTER TABLE "_events_v" DROP COLUMN "version_show_on_mall_calendar";`)
}
