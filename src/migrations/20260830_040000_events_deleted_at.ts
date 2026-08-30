import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  CREATE INDEX "events_deleted_at_idx" ON "events" USING btree ("deleted_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "events_deleted_at_idx";
  ALTER TABLE "events" DROP COLUMN "deleted_at";`)
}
