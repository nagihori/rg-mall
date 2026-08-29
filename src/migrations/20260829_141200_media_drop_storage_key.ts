import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN "storage_key";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "storage_key" varchar;
  UPDATE "media" SET "storage_key" = "filename";
  CREATE UNIQUE INDEX "media_storage_key_idx" ON "media" USING btree ("storage_key");`)
}
