CREATE TABLE "inspiration" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"drama" text NOT NULL,
	"styling_note" text NOT NULL,
	"source_url" text NOT NULL,
	"style" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL
);
