import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "storage_key" DROP NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "width" DROP NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "height" DROP NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "mime_type" SET DATA TYPE varchar;
  ALTER TABLE "media" ALTER COLUMN "mime_type" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "thumbnail_u_r_l" varchar;
  ALTER TABLE "media" ADD COLUMN "filename" varchar;
  ALTER TABLE "media" ADD COLUMN "filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "focal_x" numeric;
  ALTER TABLE "media" ADD COLUMN "focal_y" numeric;
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  DROP TYPE "public"."enum_media_mime_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_mime_type" AS ENUM('image/jpeg', 'image/png', 'image/webp');
  DROP INDEX "media_filename_idx";
  ALTER TABLE "media" ALTER COLUMN "storage_key" SET NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "mime_type" SET DATA TYPE "public"."enum_media_mime_type" USING "mime_type"::"public"."enum_media_mime_type";
  ALTER TABLE "media" ALTER COLUMN "mime_type" SET NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "width" SET NOT NULL;
  ALTER TABLE "media" ALTER COLUMN "height" SET NOT NULL;
  ALTER TABLE "media" DROP COLUMN "thumbnail_u_r_l";
  ALTER TABLE "media" DROP COLUMN "filename";
  ALTER TABLE "media" DROP COLUMN "filesize";
  ALTER TABLE "media" DROP COLUMN "focal_x";
  ALTER TABLE "media" DROP COLUMN "focal_y";`)
}
