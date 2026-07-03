// backend/routes/deviceRoutes.js
// REST endpoints for device listing and manual toggling.

const express = require('express');
const { supabase, supabaseEnabled } = require('../config/supabase');
const simulator = require('../services/simulatorService');

const router = express.Router();

// GET /api/devices — all devices (live snapshot)
router.get('/', async (_req, res) => {
  try {
    if (supabaseEnabled) {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('room_name', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      if (Array.isArray(data) && data.length > 0) {
        return res.json({ source: 'supabase', count: data.length, devices: data });
      }
    }
    // Fallback to in-memory list when Supabase is empty/unconfigured.
    const devices = simulator.getDevices();
    return res.json({ source: 'memory', count: devices.length, devices });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[deviceRoutes] GET / failed:', err.message);
    const devices = simulator.getDevices();
    return res.status(200).json({
      source: 'memory-fallback',
      count: devices.length,
      devices,
      error: err.message,
    });
  }
});

// GET /api/devices/:id — single device
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabaseEnabled) {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (data) return res.json({ device: data });
    }
    const device = simulator.getDevices().find((d) => d.id === id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    return res.json({ device });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[deviceRoutes] GET /:id failed:', err.message);
    return res.status(500).json({ error: 'Failed to fetch device', detail: err.message });
  }
});

// PATCH /api/devices/:id/toggle — manual toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await simulator.manualToggle(id);
    if (!updated) {
      return res.status(404).json({ error: 'Device not found' });
    }
    return res.json({ device: updated });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[deviceRoutes] PATCH /:id/toggle failed:', err.message);
    return res.status(500).json({ error: 'Failed to toggle device', detail: err.message });
  }
});

module.exports = router;
