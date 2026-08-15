-- ==============================================================================
-- Job Circular Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. Enable UUID / pgcrypto extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    title TEXT,
    "titleEn" TEXT,
    organization TEXT,
    "organizationEn" TEXT,
    "categoryId" TEXT,
    category TEXT,
    description TEXT,
    salary TEXT,
    vacancy TEXT,
    deadline TEXT,
    "applyLink" TEXT,
    "imageUrl" TEXT,
    images TEXT,
    status TEXT DEFAULT 'published',
    views INTEGER DEFAULT 0,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- LIVE EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.live_exams (
    id TEXT PRIMARY KEY,
    title TEXT,
    "titleEn" TEXT,
    duration INTEGER,
    "totalQuestions" INTEGER,
    subjects JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    "scheduledAt" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    title TEXT,
    category TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    duration INTEGER DEFAULT 60,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT,
    "titleEn" TEXT,
    message TEXT,
    "messageEn" TEXT,
    type TEXT,
    link TEXT,
    "createdAt" TEXT,
    read BOOLEAN DEFAULT false,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- ADMITS TABLE (Admit Cards / Exam Dates / Results)
CREATE TABLE IF NOT EXISTS public.admits (
    id TEXT PRIMARY KEY,
    "jobId" TEXT,
    type TEXT,
    "examName" TEXT,
    "examNameEn" TEXT,
    date TEXT,
    "dateEn" TEXT,
    link TEXT,
    "createdAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- ACTIVITIES TABLE (Admin Activity Log & Exam Submissions)
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    action TEXT,
    description TEXT,
    type TEXT,
    "examId" TEXT,
    "userName" TEXT,
    "userPhoto" TEXT,
    score INTEGER,
    total INTEGER,
    "scaledScore" INTEGER,
    "timeTaken" TEXT,
    "timeTakenSec" INTEGER,
    "createdAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- Migrations for existing database instances:
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS "examId" TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS "userPhoto" TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS score INTEGER;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS total INTEGER;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS "scaledScore" INTEGER;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS "timeTaken" TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS "timeTakenSec" INTEGER;

-- USERS TABLE (User Profiles & Saved Jobs)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    qualification TEXT,
    category TEXT,
    location TEXT,
    avatar TEXT,
    "savedJobs" JSONB DEFAULT '[]'::jsonb,
    "appliedJobs" JSONB DEFAULT '[]'::jsonb,
    "updatedAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- APP CONFIG TABLE (Contact and App Info)
CREATE TABLE IF NOT EXISTS public.app_config (
    id TEXT PRIMARY KEY,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "whatsappNumber" TEXT,
    "playStoreUrl" TEXT,
    "shareAppUrl" TEXT,
    "facebookPageUrl" TEXT,
    "telegramChannelUrl" TEXT,
    "supportHours" TEXT,
    "updatedAt" TEXT,
    raw_data JSONB DEFAULT '{}'::jsonb
);

-- 3. Row Level Security (RLS) Policies
-- Allow public SELECT (read-only for clients) and full access for authorized requests
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on jobs" ON public.jobs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on live_exams" ON public.live_exams FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on live_exams" ON public.live_exams FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on admits" ON public.admits FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on admits" ON public.admits FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read access on app_config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Public insert/update/delete on app_config" ON public.app_config FOR ALL USING (true) WITH CHECK (true);

-- 4. Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_activities_type_examid ON public.activities (type, "examId");
CREATE INDEX IF NOT EXISTS idx_live_exams_status ON public.live_exams (status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs ("categoryId");

-- 5. Enable Supabase Realtime for Admin Dashboard and Live Leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_exams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
