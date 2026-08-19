CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`object_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`uploaded_by_google_sub` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_media_assets_object_key_unique` ON `media_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_media_assets_post_id` ON `media_assets` (`post_id`);--> statement-breakpoint
CREATE TABLE `post_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`created_by_google_sub` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_post_revisions_post_id_created_at` ON `post_revisions` (`post_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'tech' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`author_google_sub` text NOT NULL,
	`author_email` text NOT NULL,
	`published_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_posts_status_published_at` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_category_status_published_at` ON `posts` (`category`,`status`,`published_at`);