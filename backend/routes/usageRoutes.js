// backend/routes/usageRoutes.js
// Power-usage aggregations + per-room breakdown.
// Mounted at /api so we can serve both /usage and /rooms/:roomName.

const express = require('express');
const { supabase, supabaseEnabled } = require('../config/supabase');
const { computeUsage } = require('../services/powerService');
const simulator = require('../services/simulatorService');

const router = express.Router();

async function loadDevices() {
  if (supabaseEnabled) {
    try {
      const { data, error } = await supabase.from('devices').select('*');
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[usageRoutes] Supabase fetch failed:', err.message);
    }
  }
  return simulator.getDevices();
}

// GET /api/usage — total + room-wise usage
router.get('/usage', async (_req, res) => {
  try {
    const devices = await loadDevices();
    const usage = computeUsage(devices);
    return res.json(usage);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[usageRoutes] GET /usage failed:', err.message);
    return res.status(500).json({ error: 'Failed to compute usage', detail: err.message });
  }
});

// GET /api/rooms/:roomName — devices + usage for one room.
// Accepts full room names ("Drawing Room", "drawing-room", "drawingroom") and
// short aliases ("drawing", "work1", "work2"). Case-insensitive.
const ROOM_ALIASES = {
  drawing: 'Drawing Room',
  'drawing-room': 'Drawing Room',
  drawingroom: 'Drawing Room',
  work1: 'Work Room 1',
  'work-1': 'Work Room 1',
  workroom1: 'Work Room 1',
  work2: 'Work Room 2',
  'work-2': 'Work Room 2',
  workroom2: 'Work Room 2',
};

function resolveRoomName(input) {
  if (!input) return null;
  const key = input.toLowerCase().trim();
  if (ROOM_ALIASES[key]) return ROOM_ALIASES[key];
  // Try matching against canonical names with spaces removed
  const canonical = ['Drawing Room', 'Work Room 1', 'Work Room 2'];
  for (const c of canonical) {
    if (c.toLowerCase().replace(/\s+/g, '') === key.replace(/\s+/g, '')) return c;
  }
  return null;
}

router.get('/rooms/:roomName', async (req, res) => {
  try {
    const requested = decodeURIComponent(req.params.roomName);
    const target = resolveRoomName(requested);
    if (!target) {
      return res.status(404).json({ error: `Room "${requested}" not found` });
    }
    const all = await loadDevices();
    const matches = all.filter((d) => d.room_name === target);
    if (matches.length === 0) {
      return res.status(404).json({ error: `Room "${requested}" not found` });
    }
    const usage = computeUsage(matches);
    return res.json({ room_name: matches[0].room_name, devices: matches, usage });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[usageRoutes] GET /rooms/:roomName failed:', err.message);
    return res.status(500).json({ error: 'Failed to fetch room', detail: err.message });
  }
});

module.exports = router;
