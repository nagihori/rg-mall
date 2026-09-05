import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stores" ADD COLUMN "tagline" varchar;
  ALTER TABLE "_stores_v" ADD COLUMN "version_tagline" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stores" DROP COLUMN "tagline";
  ALTER TABLE "_stores_v" DROP COLUMN "version_tagline";`)
}
