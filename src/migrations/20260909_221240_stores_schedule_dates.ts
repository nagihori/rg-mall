import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "stores_schedule_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"note" varchar
  );
  
  CREATE TABLE "_stores_v_version_schedule_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "stores_schedule_dates" ADD CONSTRAINT "stores_schedule_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_stores_v_version_schedule_dates" ADD CONSTRAINT "_stores_v_version_schedule_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_stores_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "stores_schedule_dates_order_idx" ON "stores_schedule_dates" USING btree ("_order");
  CREATE INDEX "stores_schedule_dates_parent_id_idx" ON "stores_schedule_dates" USING btree ("_parent_id");
  CREATE INDEX "_stores_v_version_schedule_dates_order_idx" ON "_stores_v_version_schedule_dates" USING btree ("_order");
  CREATE INDEX "_stores_v_version_schedule_dates_parent_id_idx" ON "_stores_v_version_schedule_dates" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "stores_schedule_dates" CASCADE;
  DROP TABLE "_stores_v_version_schedule_dates" CASCADE;`)
}
