import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_stores_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__stores_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "stores_sns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );

  CREATE TABLE "stores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"cover_image_id" integer,
  	"summary" varchar,
  	"owner" varchar,
  	"avatar_id" integer,
  	"owner_lodestone_enabled" boolean DEFAULT false,
  	"owner_lodestone_url" varchar,
  	"business_hours" varchar,
  	"body" jsonb,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_stores_status" DEFAULT 'draft'
  );

  CREATE TABLE "stores_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );

  CREATE TABLE "_stores_v_version_sns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );

  CREATE TABLE "_stores_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_cover_image_id" integer,
  	"version_summary" varchar,
  	"version_owner" varchar,
  	"version_avatar_id" integer,
  	"version_owner_lodestone_enabled" boolean DEFAULT false,
  	"version_owner_lodestone_url" varchar,
  	"version_business_hours" varchar,
  	"version_body" jsonb,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__stores_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  CREATE TABLE "_stores_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stores_id" integer;
  ALTER TABLE "stores_sns_links" ADD CONSTRAINT "stores_sns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stores" ADD CONSTRAINT "stores_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stores" ADD CONSTRAINT "stores_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stores_rels" ADD CONSTRAINT "stores_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stores_rels" ADD CONSTRAINT "stores_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stores_v_version_sns_links" ADD CONSTRAINT "_stores_v_version_sns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stores_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stores_v" ADD CONSTRAINT "_stores_v_parent_id_stores_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."stores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stores_v" ADD CONSTRAINT "_stores_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stores_v" ADD CONSTRAINT "_stores_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_stores_v_rels" ADD CONSTRAINT "_stores_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_stores_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stores_v_rels" ADD CONSTRAINT "_stores_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "stores_sns_links_order_idx" ON "stores_sns_links" USING btree ("_order");
  CREATE INDEX "stores_sns_links_parent_id_idx" ON "stores_sns_links" USING btree ("_parent_id");
  CREATE INDEX "stores_cover_image_idx" ON "stores" USING btree ("cover_image_id");
  CREATE INDEX "stores_avatar_idx" ON "stores" USING btree ("avatar_id");
  CREATE UNIQUE INDEX "stores_slug_idx" ON "stores" USING btree ("slug");
  CREATE INDEX "stores_updated_at_idx" ON "stores" USING btree ("updated_at");
  CREATE INDEX "stores_created_at_idx" ON "stores" USING btree ("created_at");
  CREATE INDEX "stores_deleted_at_idx" ON "stores" USING btree ("deleted_at");
  CREATE INDEX "stores__status_idx" ON "stores" USING btree ("_status");
  CREATE INDEX "stores_rels_order_idx" ON "stores_rels" USING btree ("order");
  CREATE INDEX "stores_rels_parent_idx" ON "stores_rels" USING btree ("parent_id");
  CREATE INDEX "stores_rels_path_idx" ON "stores_rels" USING btree ("path");
  CREATE INDEX "stores_rels_media_id_idx" ON "stores_rels" USING btree ("media_id");
  CREATE INDEX "_stores_v_version_sns_links_order_idx" ON "_stores_v_version_sns_links" USING btree ("_order");
  CREATE INDEX "_stores_v_version_sns_links_parent_id_idx" ON "_stores_v_version_sns_links" USING btree ("_parent_id");
  CREATE INDEX "_stores_v_parent_idx" ON "_stores_v" USING btree ("parent_id");
  CREATE INDEX "_stores_v_version_version_cover_image_idx" ON "_stores_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_stores_v_version_version_avatar_idx" ON "_stores_v" USING btree ("version_avatar_id");
  CREATE INDEX "_stores_v_version_version_slug_idx" ON "_stores_v" USING btree ("version_slug");
  CREATE INDEX "_stores_v_version_version_updated_at_idx" ON "_stores_v" USING btree ("version_updated_at");
  CREATE INDEX "_stores_v_version_version_created_at_idx" ON "_stores_v" USING btree ("version_created_at");
  CREATE INDEX "_stores_v_version_version_deleted_at_idx" ON "_stores_v" USING btree ("version_deleted_at");
  CREATE INDEX "_stores_v_version_version__status_idx" ON "_stores_v" USING btree ("version__status");
  CREATE INDEX "_stores_v_created_at_idx" ON "_stores_v" USING btree ("created_at");
  CREATE INDEX "_stores_v_updated_at_idx" ON "_stores_v" USING btree ("updated_at");
  CREATE INDEX "_stores_v_latest_idx" ON "_stores_v" USING btree ("latest");
  CREATE INDEX "_stores_v_rels_order_idx" ON "_stores_v_rels" USING btree ("order");
  CREATE INDEX "_stores_v_rels_parent_idx" ON "_stores_v_rels" USING btree ("parent_id");
  CREATE INDEX "_stores_v_rels_path_idx" ON "_stores_v_rels" USING btree ("path");
  CREATE INDEX "_stores_v_rels_media_id_idx" ON "_stores_v_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stores_fk" FOREIGN KEY ("stores_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_stores_id_idx" ON "payload_locked_documents_rels" USING btree ("stores_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "stores_sns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stores" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stores_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_stores_v_version_sns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_stores_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_stores_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "stores_sns_links" CASCADE;
  DROP TABLE "stores" CASCADE;
  DROP TABLE "stores_rels" CASCADE;
  DROP TABLE "_stores_v_version_sns_links" CASCADE;
  DROP TABLE "_stores_v" CASCADE;
  DROP TABLE "_stores_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stores_fk";
  DROP INDEX "payload_locked_documents_rels_stores_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "stores_id";
  DROP TYPE "public"."enum_stores_status";
  DROP TYPE "public"."enum__stores_v_version_status";`)
}
