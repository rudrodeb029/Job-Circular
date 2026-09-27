-- Phase 2B: Rate limiting table for IP-based bot protection
-- Uses D1 (5M writes/day free) instead of KV (1K writes/day)
CREATE TABLE IF NOT EXISTS rate_limits (
  ip TEXT NOT NULL,
  minute_key INTEGER NOT NULL,
  cnt INTEGER DEFAULT 1,
  PRIMARY KEY (ip, minute_key)
);
