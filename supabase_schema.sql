-- ================================================================
-- LIVE CIRCULAR - SUPABASE HARDENED SCHEMA & RLS POLICIES
-- Clean, optimized PostgreSQL schema for Supabase REST API & Realtime
-- Authorized Admin: rudrodeb029@gmail.com
-- ================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Tables (if they don't exist)
CREATE TABLE IF NOT EXISTS public.jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  titleEn TEXT,
  organization TEXT NOT NULL,
  organizationEn TEXT,
  categoryId TEXT,
  category TEXT,
  type TEXT,
  deadline DATE,
  publishDate DATE,
  description TEXT,
  descriptionEn TEXT,
  circularImage TEXT,
  circularImages TEXT[],
  images TEXT[],
  imageUrl TEXT,
  applyLink TEXT,
  applicationLink TEXT,
  source TEXT,
  vacancyCount TEXT,
  showInExamDate BOOLEAN DEFAULT false,
  showInResult BOOLEAN DEFAULT false,
  isFeatured BOOLEAN DEFAULT false,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.live_exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  titleEn TEXT,
  examType TEXT,
  totalMarks INTEGER DEFAULT 100,
  durationMinutes INTEGER DEFAULT 60,
  totalQuestions INTEGER DEFAULT 100,
  negativeMarksPerWrong DOUBLE PRECISION DEFAULT 0.25,
  passMarks INTEGER DEFAULT 40,
  startTime TIMESTAMPTZ,
  endTime TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  subjects JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  titleEn TEXT,
  category TEXT,
  year INTEGER,
  organization TEXT,
  totalQuestions INTEGER DEFAULT 0,
  durationMinutes INTEGER DEFAULT 60,
  questions JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  jobId TEXT,
  examId TEXT,
  paperId TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  organization TEXT,
  type TEXT,
  downloadLink TEXT,
  examDate DATE,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  userId TEXT,
  type TEXT NOT NULL,
  examId TEXT,
  score INTEGER,
  outOf INTEGER,
  wrongCount INTEGER,
  details TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  phone TEXT,
  email TEXT,
  district TEXT,
  education TEXT,
  targetCategory TEXT,
  pushToken TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_config (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feed_posts (
  id TEXT PRIMARY KEY,
  content TEXT,
  contentEn TEXT,
  mediaType TEXT DEFAULT 'text',
  mediaUrl TEXT,
  bannerGradient TEXT,
  likes INTEGER DEFAULT 0,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing legacy restrictive policies
DROP POLICY IF EXISTS "Public read-only on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public read-only on live_exams" ON public.live_exams;
DROP POLICY IF EXISTS "Public read-only on questions" ON public.questions;
DROP POLICY IF EXISTS "Public read-only on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public read-only on admits" ON public.admits;
DROP POLICY IF EXISTS "Public read-only on app_config" ON public.app_config;
DROP POLICY IF EXISTS "Public read-only on feed_posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Public update likes and comments on feed_posts" ON public.feed_posts;

DROP POLICY IF EXISTS "Public all on jobs" ON public.jobs;
DROP POLICY IF EXISTS "Public all on live_exams" ON public.live_exams;
DROP POLICY IF EXISTS "Public all on questions" ON public.questions;
DROP POLICY IF EXISTS "Public all on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public all on admits" ON public.admits;
DROP POLICY IF EXISTS "Public all on app_config" ON public.app_config;
DROP POLICY IF EXISTS "Public all on feed_posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Public all on activities" ON public.activities;
DROP POLICY IF EXISTS "Public all on users" ON public.users;

-- 5. Full Operational Policies (Read + Write Access for App and Admin)
CREATE POLICY "Public all on jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on live_exams" ON public.live_exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on admits" ON public.admits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on app_config" ON public.app_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on feed_posts" ON public.feed_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 6. High-Performance Database Indexes
CREATE INDEX IF NOT EXISTS idx_activities_type_examid ON public.activities (type, "examId");
CREATE INDEX IF NOT EXISTS idx_live_exams_status ON public.live_exams (status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs ("categoryId");

-- 7. Enable Supabase Realtime Broadcasts (Safe Idempotent Check)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'live_exams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_exams;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'feed_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
  END IF;
END $$;
