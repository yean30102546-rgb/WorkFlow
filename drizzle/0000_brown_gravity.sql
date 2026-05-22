CREATE TYPE "public"."job_status" AS ENUM('PENDING', 'PICKED_UP', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operator_id" text NOT NULL,
	"driver_id" text,
	"status" "job_status" DEFAULT 'PENDING' NOT NULL,
	"item_details" jsonb NOT NULL,
	"start_point" text DEFAULT 'Station A' NOT NULL,
	"end_point" text DEFAULT 'Warehouse B' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
