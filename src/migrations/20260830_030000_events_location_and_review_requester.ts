import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "location" varchar;
  ALTER TABLE "events" ADD COLUMN "review_requested_by_discord_id" varchar;
  ALTER TABLE "events" ADD COLUMN "review_requested_by_username" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_location" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_review_requested_by_discord_id" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_review_requested_by_username" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN "location";
  ALTER TABLE "events" DROP COLUMN "review_requested_by_discord_id";
  ALTER TABLE "events" DROP COLUMN "review_requested_by_username";
  ALTER TABLE "_events_v" DROP COLUMN "version_location";
  ALTER TABLE "_events_v" DROP COLUMN "version_review_requested_by_discord_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_review_requested_by_username";`)
}
