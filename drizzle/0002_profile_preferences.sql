ALTER TABLE "user" ADD COLUMN "preferred_style" text DEFAULT 'casual' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferred_weather" text DEFAULT 'tropical' NOT NULL;