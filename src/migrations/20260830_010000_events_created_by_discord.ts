import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "created_by_discord_id" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_created_by_discord_id" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN "created_by_discord_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_created_by_discord_id";`)
}
