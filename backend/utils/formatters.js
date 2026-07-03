// backend/utils/formatters.js
// Presentation helpers used by both API responses and Discord replies.
// Problem statement v1.2: 15 devices (fans + lights only, no AC).

const { formatDuration } = require('./timeUtils');

// Build the standard "room summary" used by /usage and Discord !status.
function buildRoomSummary(devices) {
  const byRoom = {};
  for (const d of devices) {
    if (!byRoom[d.room_name]) {
      byRoom[d.room_name] = { total: 0, active: 0, watts: 0 };
    }
    byRoom[d.room_name].total += 1;
    if (d.status === 'ON') {
      byRoom[d.room_name].active += 1;
      byRoom[d.room_name].watts += d.power_draw || 0;
    }
  }
  return byRoom;
}

// Pretty watts formatter: "1.2 kW" / "450 W"
function formatWatts(w) {
  if (w == null) return '—';
  if (w >= 1000) return `${(w / 1000).toFixed(2)} kW`;
  return `${w} W`;
}

// Compact list of devices for Discord replies.
function formatDeviceList(devices) {
  if (!devices || devices.length === 0) return 'No devices found.';
  return devices
    .map((d) => {
      const icon = d.status === 'ON' ? '🟢' : '⚫';
      return `${icon} ${d.device_name} (${d.device_type.toUpperCase()}) — ${d.status} · ${d.power_draw}W`;
    })
    .join('\n');
}

// Energy insight for the !usage Discord command.
// Tuned for a 15-device / 495 W max office.
function energyInsight(activeCount, totalWatts) {
  if (totalWatts === 0) return 'Office is fully powered down. Great energy discipline! 💚';
  if (totalWatts < 100) return 'Light load — looks like a break-time footprint. 👍';
  if (totalWatts < 300) return 'Moderate load. Keep an eye on devices running past office hours.';
  return 'Heavy load. Consider turning off unused fans or lights. ⚡';
}

module.exports = {
  buildRoomSummary,
  formatWatts,
  formatDeviceList,
  formatDuration,
  energyInsight,
};
