-- ====================================================================
-- SUPABASE SCHEMA MODIFICATION: AUTOMATED MASTER TIMESTAMP TRIGGER SYSTEM
-- Project: Job Circular
-- Purpose: Automates 304 Not Modified conditional checks for Cloudflare Worker & App Client
-- ====================================================================

-- 1. Create Single-Row Master Sync Control Table
CREATE TABLE IF NOT EXISTS public.app_sync_control (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial row
INSERT INTO public.app_sync_control (id, last_updated)
VALUES (1, NOW())
ON CONFLICT (id) DO NOTHING;

-- Grant Read Access to public/anon role
GRANT SELECT ON public.app_sync_control TO anon, authenticated;

-- Enable RLS (Row Level Security) and allow public read
ALTER TABLE public.app_sync_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to app_sync_control"
ON public.app_sync_control FOR SELECT
USING (true);

-- 2. PostgreSQL Function to Update Master Timestamp
CREATE OR REPLACE FUNCTION public.auto_update_app_sync_control()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.app_sync_control
  SET last_updated = NOW()
  WHERE id = 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach PostgreSQL Database Triggers across Core Tables

-- Jobs Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_jobs ON public.jobs;
CREATE TRIGGER trg_update_sync_control_jobs
AFTER INSERT OR UPDATE OR DELETE ON public.jobs
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Notifications Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_notifications ON public.notifications;
CREATE TRIGGER trg_update_sync_control_notifications
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Admits Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_admits ON public.admits;
CREATE TRIGGER trg_update_sync_control_admits
AFTER INSERT OR UPDATE OR DELETE ON public.admits
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Questions Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_questions ON public.questions;
CREATE TRIGGER trg_update_sync_control_questions
AFTER INSERT OR UPDATE OR DELETE ON public.questions
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Feed Posts Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_feed_posts ON public.feed_posts;
CREATE TRIGGER trg_update_sync_control_feed_posts
AFTER INSERT OR UPDATE OR DELETE ON public.feed_posts
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- App Config Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_app_config ON public.app_config;
CREATE TRIGGER trg_update_sync_control_app_config
AFTER INSERT OR UPDATE OR DELETE ON public.app_config
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Offline Feed Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_offline_feed ON public.offline_feed;
CREATE TRIGGER trg_update_sync_control_offline_feed
AFTER INSERT OR UPDATE OR DELETE ON public.offline_feed
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Live Exams Trigger
DROP TRIGGER IF EXISTS trg_update_sync_control_live_exams ON public.live_exams;
CREATE TRIGGER trg_update_sync_control_live_exams
AFTER INSERT OR UPDATE OR DELETE ON public.live_exams
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_update_app_sync_control();

-- Verify Table Verification
SELECT * FROM public.app_sync_control;
