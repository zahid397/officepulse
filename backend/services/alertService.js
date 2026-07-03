// backend/services/alertService.js
// Builds alerts from the current device list. Pure function — no DB calls,
// no side effects — so it is trivially testable and safe to call from any
// emitter or route handler.
//
// Problem statement v1.2 (15 devices, no AC, max 495 W office-wide):
//
// Alert rules:
//   OFFICE_HOURS — any device ON outside 9 AM–5 PM (Mon–Fri)
//   LONG_RUNNING — any device ON for more than 2 hours
//   HIGH_USAGE   — any single room drawing more than 120 W simultaneously
//                  (i.e. both fans running, or 1 fan + all 3 lights, etc.)

const { isOfficeHours, msSince } = require('../utils/timeUtils');

const LONG_RUNNING_MS = 2 * 60 * 60 * 1000; // 2 hours
// Per-room max = 165 W. Threshold 120 W = "most of the room is ON".
const ROOM_HIGH_USAGE_WATTS = 120;

function buildAlerts(devices = []) {
  const alerts = [];
  const inOffice = isOfficeHours();

  // Per-room watts accumulator for HIGH_USAGE detection.
  const roomWatts = {};
  for (const d of devices) {
    if (d.status !== 'ON') continue;
    roomWatts[d.room_name] = (roomWatts[d.room_name] || 0) + (d.power_draw || 0);
  }

  for (const d of devices) {
    if (d.status !== 'ON') continue;

    // 1) Outside office hours
    if (!inOffice) {
      alerts.push({
        type: 'OFFICE_HOURS',
        severity: 'MEDIUM',
        message: `${d.device_name} in ${d.room_name} is ON outside office hours (9 AM – 5 PM).`,
        deviceId: d.id,
        deviceName: d.device_name,
        roomName: d.room_name,
        watts: d.power_draw,
      });
    }

    // 2) Long-running
    const runtime = msSince(d.last_changed);
    if (runtime >= LONG_RUNNING_MS) {
      alerts.push({
        type: 'LONG_RUNNING',
        severity: runtime >= 4 * 60 * 60 * 1000 ? 'HIGH' : 'MEDIUM',
        message: `${d.device_name} in ${d.room_name} has been ON for over 2 hours.`,
        deviceId: d.id,
        deviceName: d.device_name,
        roomName: d.room_name,
        watts: d.power_draw,
        runtimeMs: runtime,
      });
    }
  }

  // 3) High room usage (per-room threshold)
  for (const [roomName, watts] of Object.entries(roomWatts)) {
    if (watts > ROOM_HIGH_USAGE_WATTS) {
      alerts.push({
        type: 'HIGH_USAGE',
        severity: watts >= 150 ? 'HIGH' : 'LOW',
        message: `${roomName} is drawing ${watts} W — possible unnecessary usage.`,
        deviceId: null,
        deviceName: null,
        roomName,
        watts,
      });
    }
  }

  // Stable ordering for predictable demo output
  const severityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  return alerts;
}

module.exports = { buildAlerts, LONG_RUNNING_MS, ROOM_HIGH_USAGE_WATTS };
