import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mall_name" varchar NOT NULL,
  	"server" varchar,
  	"location" varchar,
  	"contact_text" varchar,
  	"contact_link_enabled" boolean DEFAULT false,
  	"contact_link_url" varchar,
  	"recruiting_enabled" boolean DEFAULT false,
  	"recruiting_text" varchar,
  	"recruiting_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings" CASCADE;`)
}
