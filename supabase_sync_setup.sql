-- 1. Create the sync control table
CREATE TABLE IF NOT EXISTS public.app_sync_control (
    id integer PRIMARY KEY DEFAULT 1,
    last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by text DEFAULT 'system'::text NOT NULL,
    CONSTRAINT check_single_row CHECK (id = 1)
);

-- 2. Insert the single row
INSERT INTO public.app_sync_control (id, last_updated)
VALUES (1, now())
ON CONFLICT (id) DO NOTHING;

-- 3. Create the function to update the sync control timestamp
CREATE OR REPLACE FUNCTION update_app_sync_timestamp()
RETURNS trigger AS $$
BEGIN
  UPDATE public.app_sync_control
  SET last_updated = timezone('utc'::text, now()),
      updated_by = TG_TABLE_NAME
  WHERE id = 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach the trigger to all core tables
DROP TRIGGER IF EXISTS trg_jobs_sync ON public.jobs;
CREATE TRIGGER trg_jobs_sync
AFTER INSERT OR UPDATE OR DELETE ON public.jobs
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_notifications_sync ON public.notifications;
CREATE TRIGGER trg_notifications_sync
AFTER INSERT OR UPDATE OR DELETE ON public.notifications
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_admits_sync ON public.admits;
CREATE TRIGGER trg_admits_sync
AFTER INSERT OR UPDATE OR DELETE ON public.admits
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_results_sync ON public.results;
CREATE TRIGGER trg_results_sync
AFTER INSERT OR UPDATE OR DELETE ON public.results
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_questions_sync ON public.questions;
CREATE TRIGGER trg_questions_sync
AFTER INSERT OR UPDATE OR DELETE ON public.questions
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_live_exams_sync ON public.live_exams;
CREATE TRIGGER trg_live_exams_sync
AFTER INSERT OR UPDATE OR DELETE ON public.live_exams
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_feed_posts_sync ON public.feed_posts;
CREATE TRIGGER trg_feed_posts_sync
AFTER INSERT OR UPDATE OR DELETE ON public.feed_posts
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();

DROP TRIGGER IF EXISTS trg_app_config_sync ON public.app_config;
CREATE TRIGGER trg_app_config_sync
AFTER INSERT OR UPDATE OR DELETE ON public.app_config
FOR EACH STATEMENT EXECUTE FUNCTION update_app_sync_timestamp();
