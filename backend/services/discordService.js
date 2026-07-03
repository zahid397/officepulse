// backend/services/discordService.js
// Thin read-only layer used by the Discord bot so it does not duplicate
// Supabase / formatting logic. All functions are defensive: any error is
// caught and converted into a friendly Discord string.
//
// Problem statement v1.2: 15 devices (fans + lights only, no AC).

const { supabase, supabaseEnabled } = require('../config/supabase');
const { computeUsage, MAX_OFFICE_WATTS } = require('./powerService');
const { buildAlerts } = require('./alertService');
const { formatWatts, energyInsight } = require('../utils/formatters');
const simulator = require('./simulatorService');

// Reads through Supabase when available, but ALWAYS falls back to the
// same in-memory store the REST API and simulator use. This is what makes
// "the bot and dashboard share one backend / one source of truth" true in
// practice — the bot must work identically whether or not Supabase is
// configured, exactly like deviceRoutes/usageRoutes/alertRoutes already do.
async function fetchDevices() {
  if (supabaseEnabled) {
    try {
      const { data, error } = await supabase.from('devices').select('*');
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[discordService] fetchDevices failed, using in-memory store:', err.message);
    }
  }
  return simulator.getDevices();
}

// Build a per-room one-liner like:
//   "Drawing Room: 1 fan ON, 2 lights ON."
//   "Work Room 1: all OFF."
function roomOneLiner(devices, roomName) {
  const roomDevices = devices.filter((d) => d.room_name === roomName);
  const fansOn = roomDevices.filter((d) => d.device_type === 'fan' && d.status === 'ON').length;
  const lightsOn = roomDevices.filter((d) => d.device_type === 'light' && d.status === 'ON').length;
  if (fansOn === 0 && lightsOn === 0) return `${roomName}: all OFF.`;
  const parts = [];
  if (fansOn > 0) parts.push(`${fansOn} fan${fansOn > 1 ? 's' : ''} ON`);
  if (lightsOn > 0) parts.push(`${lightsOn} light${lightsOn > 1 ? 's' : ''} ON`);
  return `${roomName}: ${parts.join(', ')}.`;
}

async function buildStatusMessage() {
  const devices = await fetchDevices();
  if (devices.length === 0) {
    return '⚠️ No devices found. Make sure Supabase is configured and seeded.';
  }
  const usage = computeUsage(devices);
  const rooms = Object.keys(usage.rooms);

  const lines = [
    '**🏠 OfficePulse — Status**',
    '',
    `🔴 Active devices: **${usage.active_devices}/${usage.total_devices}**`,
    `⚡ Total power: **${formatWatts(usage.total_watts)}** (max ${formatWatts(MAX_OFFICE_WATTS)})`,
    `🌀 Fans ON: ${usage.fans_on}  ·  💡 Lights ON: ${usage.lights_on}`,
    '',
    '**Room-wise summary:**',
  ];
  for (const room of rooms) {
    lines.push(`• ${roomOneLiner(devices, room)}`);
  }
  return lines.join('\n');
}

// Aliases supported by the !room command
const ROOM_ALIASES = {
  drawing: 'Drawing Room',
  'drawing-room': 'Drawing Room',
  'drawingroom': 'Drawing Room',
  work1: 'Work Room 1',
  'work-1': 'Work Room 1',
  'workroom1': 'Work Room 1',
  work2: 'Work Room 2',
  'work-2': 'Work Room 2',
  'workroom2': 'Work Room 2',
};

function resolveRoomName(arg) {
  if (!arg) return null;
  const key = arg.toLowerCase().trim();
  return ROOM_ALIASES[key] || key;
}

async function buildRoomMessage(arg) {
  const target = resolveRoomName(arg);
  if (!target) {
    return 'Usage: `!room drawing` | `!room work1` | `!room work2`';
  }
  const devices = await fetchDevices();
  const roomDevices = devices.filter((d) => d.room_name === target);
  if (roomDevices.length === 0) {
    return `❌ No devices found for room "${target}".`;
  }
  const usage = computeUsage(roomDevices);
  const fansOn = roomDevices.filter((d) => d.device_type === 'fan' && d.status === 'ON').length;
  const lightsOn = roomDevices.filter((d) => d.device_type === 'light' && d.status === 'ON').length;

  const lines = [
    `**${target}** — ${fansOn} fan(s) ON, ${lightsOn} light(s) ON · ${formatWatts(usage.total_watts)}`,
    '',
    ...roomDevices.map((d) => {
      const icon = d.status === 'ON' ? '🟢' : '⚫';
      const typeLabel = d.device_type.toUpperCase();
      return `${icon} ${d.device_name} (${typeLabel}) — ${d.status} · ${d.power_draw}W`;
    }),
  ];
  return lines.join('\n');
}

async function buildUsageMessage() {
  const devices = await fetchDevices();
  if (devices.length === 0) {
    return '⚠️ No devices found. Make sure Supabase is configured and seeded.';
  }
  const usage = computeUsage(devices);
  const lines = [
    '**⚡ OfficePulse — Usage**',
    '',
    `Total current power: **${formatWatts(usage.total_watts)}** / ${formatWatts(MAX_OFFICE_WATTS)} (${usage.load_percent}% of max)`,
    `Active devices: **${usage.active_devices}/${usage.total_devices}**`,
    `Average per active device: ${formatWatts(usage.avg_watts_per_active)}`,
    '',
    energyInsight(usage.active_devices, usage.total_watts),
  ];
  return lines.join('\n');
}

async function buildAlertsMessage() {
  const devices = await fetchDevices();
  if (devices.length === 0) {
    return '⚠️ No devices found. Make sure Supabase is configured and seeded.';
  }
  const alerts = buildAlerts(devices);
  if (alerts.length === 0) {
    return '✅ No critical power alerts right now.';
  }
  const lines = [`**🚨 OfficePulse — ${alerts.length} alert(s)**`, ''];
  for (const a of alerts.slice(0, 8)) {
    const badge = a.severity === 'HIGH' ? '🔴' : a.severity === 'MEDIUM' ? '🟠' : '🟡';
    lines.push(`${badge} [${a.type}] ${a.message}`);
  }
  return lines.join('\n');
}

module.exports = {
  buildStatusMessage,
  buildRoomMessage,
  buildUsageMessage,
  buildAlertsMessage,
  roomOneLiner,
  ROOM_ALIASES,
};
