INSERT INTO `post_revisions` (
	`post_id`, `title`, `excerpt`, `content`, `category`, `tech_collection`, `topic`, `status`,
	`created_by_google_sub`, `created_at`
)
SELECT
	`id`, `title`, `excerpt`, `content`, `category`, `tech_collection`, `topic`, `status`,
	`author_google_sub`, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM `posts`
WHERE instr(`title`, '它') > 0
	OR instr(`excerpt`, '它') > 0
	OR instr(`content`, '它') > 0;
--> statement-breakpoint
UPDATE `posts`
SET
	`title` = replace(`title`, '它', '他'),
	`excerpt` = replace(`excerpt`, '它', '他'),
	`content` = replace(`content`, '它', '他'),
	`updated_at` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE instr(`title`, '它') > 0
	OR instr(`excerpt`, '它') > 0
	OR instr(`content`, '它') > 0;
