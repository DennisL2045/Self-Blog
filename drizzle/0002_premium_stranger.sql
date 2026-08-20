ALTER TABLE `post_revisions` ADD `tech_collection` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `tech_collection` text;--> statement-breakpoint
UPDATE `posts` SET `tech_collection` = CASE
  WHEN `topic` IN ('backend-api', 'database') THEN 'backend-data'
  WHEN `topic` = 'programming' THEN 'programming'
  WHEN `topic` = 'system-ops' THEN 'systems-ops'
  WHEN `topic` = 'ai-engineering' THEN 'ai-engineering'
  ELSE 'web-development'
END WHERE `category` = 'tech';--> statement-breakpoint
UPDATE `post_revisions` SET `tech_collection` = CASE
  WHEN `topic` IN ('backend-api', 'database') THEN 'backend-data'
  WHEN `topic` = 'programming' THEN 'programming'
  WHEN `topic` = 'system-ops' THEN 'systems-ops'
  WHEN `topic` = 'ai-engineering' THEN 'ai-engineering'
  ELSE 'web-development'
END WHERE `category` = 'tech';--> statement-breakpoint
CREATE INDEX `idx_posts_tech_collection_status_published_at` ON `posts` (`tech_collection`,`status`,`published_at`);
