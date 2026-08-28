CREATE TABLE `contact_rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fingerprint` text NOT NULL,
	`email_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_contact_rate_limits_fingerprint_created_at` ON `contact_rate_limits` (`fingerprint`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_rate_limits_email_hash_created_at` ON `contact_rate_limits` (`email_hash`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_rate_limits_created_at` ON `contact_rate_limits` (`created_at`);--> statement-breakpoint
PRAGMA optimize;
