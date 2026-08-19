ALTER TABLE `post_revisions` ADD `topic` text DEFAULT 'javascript' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `topic` text DEFAULT 'javascript' NOT NULL;