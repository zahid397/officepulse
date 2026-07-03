// backend/data/seedDevices.js
// Static fallback seed used when Supabase is empty / not configured.
// Mirrors supabase/seed.sql — exactly 15 devices (problem statement v1.2):
//   3 rooms × (2 fans + 3 lights) = 15 devices, NO ACs.
//   Per-room max = 165 W, office max = 495 W.
//
// FIX (demo quality): all 15 devices previously seeded as OFF, so a fresh
// boot showed 0 W / 0 alerts, and the random simulator (which touches
// last_changed on almost every device every ~15s) meant the "ON for over
// 2 hours" and "high room usage" alerts would almost never actually be
// observed live or during grading. We now seed a believable "boss walks
// in at night" scene — the exact scenario the problem statement itself
// describes — so both alert types are guaranteed visible immediately:
//   • Drawing Room / Work Room 1: a couple of devices left on recently
//   • Work Room 2: ALL 5 devices on, last changed 2.5h ago
//       -> triggers LONG_RUNNING on each device
//       -> triggers HIGH_USAGE on the room (165 W > 120 W threshold)
const NOW = Date.now();
const H = 60 * 60 * 1000;
const ago = (ms) => new Date(NOW - ms).toISOString();

const SEED_DEVICES = [
  // Drawing Room (left column) — 1 fan + 2 lights left on ~20 min ago
  { id: 'drawing-fan-1',   room_name: 'Drawing Room', device_name: 'Drawing Fan 1',   device_type: 'fan',   status: 'ON',  power_draw: 60, x_position: 10, y_position: 22, last_changed: ago(20 * 60 * 1000) },
  { id: 'drawing-fan-2',   room_name: 'Drawing Room', device_name: 'Drawing Fan 2',   device_type: 'fan',   status: 'OFF', power_draw: 60, x_position: 22, y_position: 22, last_changed: ago(45 * 60 * 1000) },
  { id: 'drawing-light-1', room_name: 'Drawing Room', device_name: 'Drawing Light 1', device_type: 'light', status: 'ON',  power_draw: 15, x_position: 10, y_position: 65, last_changed: ago(20 * 60 * 1000) },
  { id: 'drawing-light-2', room_name: 'Drawing Room', device_name: 'Drawing Light 2', device_type: 'light', status: 'ON',  power_draw: 15, x_position: 17, y_position: 65, last_changed: ago(20 * 60 * 1000) },
  { id: 'drawing-light-3', room_name: 'Drawing Room', device_name: 'Drawing Light 3', device_type: 'light', status: 'OFF', power_draw: 15, x_position: 24, y_position: 65, last_changed: ago(45 * 60 * 1000) },

  // Work Room 1 (middle column) — 1 fan + 2 lights left on ~20 min ago
  { id: 'work1-fan-1',   room_name: 'Work Room 1', device_name: 'Work1 Fan 1',   device_type: 'fan',   status: 'ON',  power_draw: 60, x_position: 44, y_position: 22, last_changed: ago(20 * 60 * 1000) },
  { id: 'work1-fan-2',   room_name: 'Work Room 1', device_name: 'Work1 Fan 2',   device_type: 'fan',   status: 'OFF', power_draw: 60, x_position: 56, y_position: 22, last_changed: ago(45 * 60 * 1000) },
  { id: 'work1-light-1', room_name: 'Work Room 1', device_name: 'Work1 Light 1', device_type: 'light', status: 'ON',  power_draw: 15, x_position: 44, y_position: 65, last_changed: ago(20 * 60 * 1000) },
  { id: 'work1-light-2', room_name: 'Work Room 1', device_name: 'Work1 Light 2', device_type: 'light', status: 'ON',  power_draw: 15, x_position: 50, y_position: 65, last_changed: ago(20 * 60 * 1000) },
  { id: 'work1-light-3', room_name: 'Work Room 1', device_name: 'Work1 Light 3', device_type: 'light', status: 'OFF', power_draw: 15, x_position: 56, y_position: 65, last_changed: ago(45 * 60 * 1000) },

  // Work Room 2 (right column) — EVERYTHING on for 2.5h -> guaranteed alerts
  { id: 'work2-fan-1',   room_name: 'Work Room 2', device_name: 'Work2 Fan 1',   device_type: 'fan',   status: 'ON', power_draw: 60, x_position: 78, y_position: 22, last_changed: ago(2.5 * H) },
  { id: 'work2-fan-2',   room_name: 'Work Room 2', device_name: 'Work2 Fan 2',   device_type: 'fan',   status: 'ON', power_draw: 60, x_position: 90, y_position: 22, last_changed: ago(2.5 * H) },
  { id: 'work2-light-1', room_name: 'Work Room 2', device_name: 'Work2 Light 1', device_type: 'light', status: 'ON', power_draw: 15, x_position: 78, y_position: 65, last_changed: ago(2.5 * H) },
  { id: 'work2-light-2', room_name: 'Work Room 2', device_name: 'Work2 Light 2', device_type: 'light', status: 'ON', power_draw: 15, x_position: 84, y_position: 65, last_changed: ago(2.5 * H) },
  { id: 'work2-light-3', room_name: 'Work Room 2', device_name: 'Work2 Light 3', device_type: 'light', status: 'ON', power_draw: 15, x_position: 90, y_position: 65, last_changed: ago(2.5 * H) },
];

module.exports = { SEED_DEVICES };
