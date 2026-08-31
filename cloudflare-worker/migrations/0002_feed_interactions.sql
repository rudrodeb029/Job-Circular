-- Cloudflare D1: Feed Interactions and User Profiles Queues
-- To buffer high-frequency operations before syncing to Supabase in batches.

CREATE TABLE IF NOT EXISTS feed_likes_queue (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  synced INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_comments_queue (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  comment_data TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles_queue (
  id TEXT PRIMARY KEY, -- User ID
  profile_data TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_likes_synced ON feed_likes_queue(synced);
CREATE INDEX IF NOT EXISTS idx_comments_synced ON feed_comments_queue(synced);
CREATE INDEX IF NOT EXISTS idx_profiles_synced ON user_profiles_queue(synced);
