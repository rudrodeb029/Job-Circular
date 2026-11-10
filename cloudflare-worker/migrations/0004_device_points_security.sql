-- Phase 4: Device Points Security and AdMob Cooldown tracking table
-- Prevents point fraud, repeat welcome bonuses, and AdMob invalid traffic
CREATE TABLE IF NOT EXISTS device_points_security (
  device_id TEXT PRIMARY KEY,
  welcome_bonus_claimed INTEGER DEFAULT 0,
  last_ad_time INTEGER DEFAULT 0,
  daily_ad_date TEXT DEFAULT '',
  daily_ad_count INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
);
