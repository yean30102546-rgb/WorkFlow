ALTER TABLE "jobs" ADD COLUMN "request_image_url" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "success_image_url" text;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "picked_up_at" timestamp;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "completed_at" timestamp;