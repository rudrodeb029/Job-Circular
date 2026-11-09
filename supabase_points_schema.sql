-- ====================================================================
-- SUPABASE SCHEMA: LIVE EXAM REWARDED POINTS SYSTEM
-- Note: The app automatically stores and syncs `liveExamPoints`, `unlockedExams`,
-- `dailyAdCount`, `pointsHistory`, and `pointCost` inside `raw_data` JSONB
-- on `public.users` and `public.live_exams`, so it works immediately.
-- Running this script optionally adds dedicated top-level columns & indexes.
-- ====================================================================

ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS "liveExamPoints" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "unlockedExams" JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "dailyAdDate" TEXT,
  ADD COLUMN IF NOT EXISTS "dailyAdCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "pointsHistory" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE IF EXISTS public.live_exams
  ADD COLUMN IF NOT EXISTS "pointCost" INTEGER NOT NULL DEFAULT 20;
