-- ============================================================
-- OfficePulse — Supabase schema (problem statement v1.2)
-- 3 rooms × 5 devices = 15 devices total (2 fans + 3 lights per room)
-- NO AC devices. Run this in Supabase SQL Editor first, then seed.sql
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Table: devices
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devices (
  id            text PRIMARY KEY,
  room_name     text NOT NULL,
  device_name   text NOT NULL,
  device_type   text NOT NULL CHECK (device_type IN ('fan', 'light')),
  status        text NOT NULL DEFAULT 'OFF' CHECK (status IN ('ON', 'OFF')),
  power_draw    integer NOT NULL,
  last_changed  timestamptz NOT NULL DEFAULT now(),
  x_position    integer,
  y_position    integer,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Table: device_events
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id   text REFERENCES devices(id) ON DELETE CASCADE,
  old_status  text,
  new_status  text,
  changed_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_devices_room ON devices(room_name);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_events_device ON device_events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_changed ON device_events(changed_at DESC);

-- Helpful view for room/type summary
CREATE OR REPLACE VIEW device_summary AS
SELECT
  room_name,
  device_type,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'ON') AS active,
  COALESCE(SUM(power_draw) FILTER (WHERE status = 'ON'), 0) AS active_watts
FROM devices
GROUP BY room_name, device_type
ORDER BY room_name, device_type;

-- Row Level Security — backend uses service role key (bypasses RLS).
-- Allow anonymous read access for demo / direct inspection.
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read devices" ON devices;
CREATE POLICY "Public read devices" ON devices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read events" ON device_events;
CREATE POLICY "Public read events" ON device_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role write devices" ON devices;
CREATE POLICY "Service role write devices" ON devices
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role write events" ON device_events;
CREATE POLICY "Service role write events" ON device_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
