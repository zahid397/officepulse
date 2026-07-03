// backend/services/simulatorService.js
// Auto-toggles 1–3 random devices every 15 seconds, persists changes to
// Supabase, records events, and emits socket updates. Designed to be
// resilient: if Supabase is unreachable, the simulator keeps running on
// the in-memory device list so the dashboard demo never goes stale.

const { supabase, supabaseEnabled } = require('../config/supabase');
const { SEED_DEVICES } = require('../data/seedDevices');
const { computeUsage } = require('./powerService');
const { buildAlerts } = require('./alertService');

const SIM_INTERVAL_MS = 15_000;
const MIN_TOGGLE = 1;
const MAX_TOGGLE = 3;

// In-memory cache (single source of truth at runtime). Hydrated from
// Supabase on start, falls back to SEED_DEVICES if Supabase is empty.
let devices = SEED_DEVICES.map((d) => ({ ...d }));
let io = null;
let timer = null;

function setIo(socketIoInstance) {
  io = socketIoInstance;
}

function getDevices() {
  return devices;
}

function pickRandom(arr, count) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < count && copy.length > 0; i += 1) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function hydrateFromSupabase() {
  if (!supabaseEnabled) return;
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) {
      devices = data;
      // eslint-disable-next-line no-console
      console.log(`[simulator] Hydrated ${devices.length} devices from Supabase`);
    } else {
      // Supabase is up but empty — push SEED_DEVICES so the dashboard has data.
      // eslint-disable-next-line no-console
      console.log('[simulator] Supabase has no devices. Seeding from local fallback...');
      for (const d of SEED_DEVICES) {
        await supabase.from('devices').upsert(d);
      }
      devices = SEED_DEVICES.map((d) => ({ ...d }));
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[simulator] Hydrate failed (using local seed):', err.message);
  }
}

async function persistToggle(device, newStatus) {
  if (!supabaseEnabled) return;
  try {
    const now = new Date().toISOString();
    await supabase
      .from('devices')
      .update({ status: newStatus, last_changed: now })
      .eq('id', device.id);

    await supabase.from('device_events').insert({
      device_id: device.id,
      old_status: device.status,
      new_status: newStatus,
      changed_at: now,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[simulator] Persist toggle failed:', err.message);
  }
}

function broadcast() {
  if (!io) return;
  const usage = computeUsage(devices);
  const alerts = buildAlerts(devices);
  io.emit('devices:update', devices);
  io.emit('usage:update', usage);
  io.emit('alerts:update', alerts);
}

async function tick() {
  try {
    const toggleCount =
      Math.floor(Math.random() * (MAX_TOGGLE - MIN_TOGGLE + 1)) + MIN_TOGGLE;
    const chosen = pickRandom(devices, toggleCount);

    for (const device of chosen) {
      const newStatus = device.status === 'ON' ? 'OFF' : 'ON';
      // eslint-disable-next-line no-console
      console.log(
        `[simulator] ${device.device_name} (${device.room_name}) -> ${newStatus}`
      );
      await persistToggle(device, newStatus);
      // Update in-memory record
      device.status = newStatus;
      device.last_changed = new Date().toISOString();
    }
    broadcast();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[simulator] Tick error:', err.message);
  }
}

// Manual toggle (called from PATCH /api/devices/:id/toggle)
async function manualToggle(deviceId) {
  const device = devices.find((d) => d.id === deviceId);
  if (!device) return null;
  const newStatus = device.status === 'ON' ? 'OFF' : 'ON';
  await persistToggle(device, newStatus);
  device.status = newStatus;
  device.last_changed = new Date().toISOString();
  broadcast();
  return device;
}

function start() {
  if (timer) return;
  // eslint-disable-next-line no-console
  console.log(`[simulator] Starting — interval ${SIM_INTERVAL_MS}ms`);
  // Fire one immediate tick so the dashboard shows life within 1s of boot,
  // then schedule recurring ticks.
  setTimeout(tick, 1000);
  timer = setInterval(tick, SIM_INTERVAL_MS);
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  setIo,
  getDevices,
  hydrateFromSupabase,
  manualToggle,
  start,
  stop,
};
