CREATE TABLE "saved_outfit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"item_ids" uuid[] NOT NULL,
	"style" text NOT NULL,
	"weather" text NOT NULL,
	"feedback" text,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_outfit_selection_unique" UNIQUE("user_id","style","weather","item_ids")
);
--> statement-breakpoint
ALTER TABLE "saved_outfit" ADD CONSTRAINT "saved_outfit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;