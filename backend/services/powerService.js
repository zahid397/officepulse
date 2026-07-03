// backend/services/powerService.js
// Pure calculation module — given a device list, returns usage stats.
// Problem statement v1.2: 15 devices total (no AC), max 495 W office-wide.
// Kept side-effect free so it can be reused by API routes, socket emitter,
// and Discord bot without re-querying Supabase.

const { buildRoomSummary } = require('../utils/formatters');

const POWER_BY_TYPE = { fan: 60, light: 15 };
// Office-wide theoretical maximum: 3 rooms × (2×60 + 3×15) = 3 × 165 = 495 W
const MAX_OFFICE_WATTS = 495;

function computeUsage(devices = []) {
  const total = devices.length;
  let active = 0;
  let watts = 0;
  const countsByType = { fan: 0, light: 0 };

  for (const d of devices) {
    if (d.status === 'ON') {
      active += 1;
      watts += d.power_draw || POWER_BY_TYPE[d.device_type] || 0;
      if (countsByType[d.device_type] !== undefined) countsByType[d.device_type] += 1;
    }
  }

  const roomSummary = buildRoomSummary(devices);
  const avgWattsPerActive = active > 0 ? Math.round(watts / active) : 0;
  const loadPercent = MAX_OFFICE_WATTS > 0 ? Math.round((watts / MAX_OFFICE_WATTS) * 100) : 0;

  return {
    total_devices: total,
    active_devices: active,
    inactive_devices: total - active,
    total_watts: watts,
    max_possible_watts: MAX_OFFICE_WATTS,
    load_percent: loadPercent,
    avg_watts_per_active: avgWattsPerActive,
    fans_on: countsByType.fan,
    lights_on: countsByType.light,
    rooms: roomSummary,
  };
}

module.exports = { computeUsage, POWER_BY_TYPE, MAX_OFFICE_WATTS };
