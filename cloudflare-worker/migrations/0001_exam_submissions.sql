-- Cloudflare D1: Live Exam Submissions Table
-- This table stores all exam submissions with server-side graded scores.
-- Data is batch-synced to Supabase via Smart Batch Cron.

CREATE TABLE IF NOT EXISTS exam_submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_photo TEXT DEFAULT '',
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  scaled_score REAL NOT NULL,
  time_taken TEXT NOT NULL,
  time_taken_sec INTEGER NOT NULL,
  answers TEXT NOT NULL,
  rank INTEGER DEFAULT 0,
  synced_to_supabase INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exam_id ON exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_synced ON exam_submissions(synced_to_supabase);
CREATE INDEX IF NOT EXISTS idx_rank ON exam_submissions(exam_id, scaled_score DESC, time_taken_sec ASC);
CREATE INDEX IF NOT EXISTS idx_created ON exam_submissions(created_at DESC);
