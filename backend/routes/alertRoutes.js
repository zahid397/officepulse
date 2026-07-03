// backend/routes/alertRoutes.js
// Current alert list.  Mounted at /api/alerts.

const express = require('express');
const { supabase, supabaseEnabled } = require('../config/supabase');
const { buildAlerts } = require('../services/alertService');
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
      console.error('[alertRoutes] Supabase fetch failed:', err.message);
    }
  }
  return simulator.getDevices();
}

// GET /api/alerts — current alerts
router.get('/', async (_req, res) => {
  try {
    const devices = await loadDevices();
    const alerts = buildAlerts(devices);
    return res.json({ count: alerts.length, alerts });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[alertRoutes] GET / failed:', err.message);
    return res.status(500).json({ error: 'Failed to build alerts', detail: err.message });
  }
});

module.exports = router;
