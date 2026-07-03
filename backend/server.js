// backend/server.js
// OfficePulse backend entry point.
// Starts Express + Socket.io + simulator + Discord bot.
// Designed to boot and stay alive even when Supabase or Discord are missing.

require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');

const { initSocket } = require('./socket');
const { supabaseEnabled } = require('./config/supabase');
const deviceRoutes = require('./routes/deviceRoutes');
const usageRoutes = require('./routes/usageRoutes');
const alertRoutes = require('./routes/alertRoutes');
const simulator = require('./services/simulatorService');
const { startBot } = require('./discord/bot');

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

const app = express();

// Middleware
app.use(cors({ origin: FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN.split(','), methods: ['GET', 'POST', 'PATCH', 'OPTIONS'] }));
app.use(express.json());

// Simple request logger (helpful for demo Q&A)
app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(`[http] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'officepulse-backend',
    time: new Date().toISOString(),
    supabase: supabaseEnabled ? 'configured' : 'missing-fallback',
    discord: process.env.DISCORD_TOKEN ? 'configured' : 'disabled',
    simulator: 'running',
  });
});

// API routes
app.use('/api/devices', deviceRoutes);
app.use('/api', usageRoutes); // serves /api/usage and /api/rooms/:roomName
app.use('/api/alerts', alertRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Global error handler
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// Create HTTP server and bind Socket.io
const httpServer = http.createServer(app);
const io = initSocket(httpServer, FRONTEND_ORIGIN);

// Wire simulator with the io instance so it can broadcast updates
simulator.setIo(io);

// Boot sequence
async function boot() {
  // 1) Hydrate devices from Supabase (or fall back to local seed)
  await simulator.hydrateFromSupabase();

  // 2) Start the auto-simulator (15s interval)
  simulator.start();

  // 3) Start Discord bot only if token exists
  startBot();

  // 4) Start HTTP + Socket.io server
  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('========================================================');
    console.log(`  OfficePulse backend running on port ${PORT}`);
    console.log(`  Health:    http://localhost:${PORT}/health`);
    console.log(`  Devices:   http://localhost:${PORT}/api/devices`);
    console.log(`  Usage:     http://localhost:${PORT}/api/usage`);
    console.log(`  Alerts:    http://localhost:${PORT}/api/alerts`);
    console.log(`  Supabase:  ${supabaseEnabled ? 'enabled' : 'fallback (local seed)'}`);
    console.log(`  Discord:   ${process.env.DISCORD_TOKEN ? 'enabled' : 'disabled'}`);
    console.log('========================================================');
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('[server] SIGTERM — shutting down');
  simulator.stop();
  httpServer.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('[server] SIGINT — shutting down');
  simulator.stop();
  httpServer.close(() => process.exit(0));
});

boot().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Boot failed:', err);
  process.exit(1);
});
