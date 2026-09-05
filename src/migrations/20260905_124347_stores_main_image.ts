import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stores" ADD COLUMN "main_image_id" integer;
  ALTER TABLE "_stores_v" ADD COLUMN "version_main_image_id" integer;
  ALTER TABLE "stores" ADD CONSTRAINT "stores_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stores_v" ADD CONSTRAINT "_stores_v_version_main_image_id_media_id_fk" FOREIGN KEY ("version_main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "stores_main_image_idx" ON "stores" USING btree ("main_image_id");
  CREATE INDEX "_stores_v_version_version_main_image_idx" ON "_stores_v" USING btree ("version_main_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stores" DROP CONSTRAINT "stores_main_image_id_media_id_fk";
  
  ALTER TABLE "_stores_v" DROP CONSTRAINT "_stores_v_version_main_image_id_media_id_fk";
  
  DROP INDEX "stores_main_image_idx";
  DROP INDEX "_stores_v_version_version_main_image_idx";
  ALTER TABLE "stores" DROP COLUMN "main_image_id";
  ALTER TABLE "_stores_v" DROP COLUMN "version_main_image_id";`)
}
