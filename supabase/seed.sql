-- ============================================================
-- OfficePulse — Supabase seed data (problem statement v1.2)
-- Exactly 15 devices: 3 rooms × (2 fans + 3 lights)
-- Per-room max = 165 W (60+60+15+15+15)
-- Office max   = 495 W (165 × 3)
--
-- Floor map layout (3 rooms side by side, percentages of a 16:9 area):
--   Drawing Room  : x 4–30   (left column)
--   Work Room 1   : x 37–63  (middle column)
--   Work Room 2   : x 70–96  (right column)
--   Fans on top row (y 22), Lights on bottom row (y 65)
-- ============================================================

-- Clean previous seed data (idempotent re-runs)
DELETE FROM device_events;
DELETE FROM devices;

-- ============================================================
-- Drawing Room (left column) — 1 fan + 2 lights left on ~20 min ago
-- ============================================================
INSERT INTO devices (id, room_name, device_name, device_type, status, power_draw, x_position, y_position, last_changed) VALUES
('drawing-fan-1',   'Drawing Room', 'Drawing Fan 1',   'fan',   'ON',  60, 10, 22, now() - interval '20 minutes'),
('drawing-fan-2',   'Drawing Room', 'Drawing Fan 2',   'fan',   'OFF', 60, 22, 22, now() - interval '45 minutes'),
('drawing-light-1', 'Drawing Room', 'Drawing Light 1', 'light', 'ON',  15, 10, 65, now() - interval '20 minutes'),
('drawing-light-2', 'Drawing Room', 'Drawing Light 2', 'light', 'ON',  15, 17, 65, now() - interval '20 minutes'),
('drawing-light-3', 'Drawing Room', 'Drawing Light 3', 'light', 'OFF', 15, 24, 65, now() - interval '45 minutes');

-- ============================================================
-- Work Room 1 (middle column) — 1 fan + 2 lights left on ~20 min ago
-- ============================================================
INSERT INTO devices (id, room_name, device_name, device_type, status, power_draw, x_position, y_position, last_changed) VALUES
('work1-fan-1',   'Work Room 1', 'Work1 Fan 1',   'fan',   'ON',  60, 44, 22, now() - interval '20 minutes'),
('work1-fan-2',   'Work Room 1', 'Work1 Fan 2',   'fan',   'OFF', 60, 56, 22, now() - interval '45 minutes'),
('work1-light-1', 'Work Room 1', 'Work1 Light 1', 'light', 'ON',  15, 44, 65, now() - interval '20 minutes'),
('work1-light-2', 'Work Room 1', 'Work1 Light 2', 'light', 'ON',  15, 50, 65, now() - interval '20 minutes'),
('work1-light-3', 'Work Room 1', 'Work1 Light 3', 'light', 'OFF', 15, 56, 65, now() - interval '45 minutes');

-- ============================================================
-- Work Room 2 (right column) — EVERYTHING on for 2.5h.
-- This is deliberately the exact "did someone forget to leave?" scenario
-- from the problem statement, so LONG_RUNNING (each device >2h) and
-- HIGH_USAGE (165W room total > 120W threshold) alerts are guaranteed to
-- be visible the moment the dashboard/bot are opened — not left to chance
-- under the random simulator.
-- ============================================================
INSERT INTO devices (id, room_name, device_name, device_type, status, power_draw, x_position, y_position, last_changed) VALUES
('work2-fan-1',   'Work Room 2', 'Work2 Fan 1',   'fan',   'ON', 60, 78, 22, now() - interval '2 hours 30 minutes'),
('work2-fan-2',   'Work Room 2', 'Work2 Fan 2',   'fan',   'ON', 60, 90, 22, now() - interval '2 hours 30 minutes'),
('work2-light-1', 'Work Room 2', 'Work2 Light 1', 'light', 'ON', 15, 78, 65, now() - interval '2 hours 30 minutes'),
('work2-light-2', 'Work Room 2', 'Work2 Light 2', 'light', 'ON', 15, 84, 65, now() - interval '2 hours 30 minutes'),
('work2-light-3', 'Work Room 2', 'Work2 Light 3', 'light', 'ON', 15, 90, 65, now() - interval '2 hours 30 minutes');

-- ============================================================
-- Seed matching historical events so device_events isn't empty on first load
-- ============================================================
INSERT INTO device_events (device_id, old_status, new_status, changed_at) VALUES
('drawing-fan-1',   'OFF', 'ON', now() - interval '20 minutes'),
('drawing-light-1', 'OFF', 'ON', now() - interval '20 minutes'),
('drawing-light-2', 'OFF', 'ON', now() - interval '20 minutes'),
('work1-fan-1',     'OFF', 'ON', now() - interval '20 minutes'),
('work1-light-1',   'OFF', 'ON', now() - interval '20 minutes'),
('work1-light-2',   'OFF', 'ON', now() - interval '20 minutes'),
('work2-fan-1',     'OFF', 'ON', now() - interval '2 hours 30 minutes'),
('work2-fan-2',     'OFF', 'ON', now() - interval '2 hours 30 minutes'),
('work2-light-1',   'OFF', 'ON', now() - interval '2 hours 30 minutes'),
('work2-light-2',   'OFF', 'ON', now() - interval '2 hours 30 minutes'),
('work2-light-3',   'OFF', 'ON', now() - interval '2 hours 30 minutes');
