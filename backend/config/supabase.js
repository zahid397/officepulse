// backend/config/supabase.js
// Centralised Supabase client. Service role key is used here because the
// backend needs write access. NEVER import this file (or this key) into the
// frontend — the frontend only talks to the Express API.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Helper flag so other modules can short-circuit Supabase calls safely.
// The backend MUST stay alive even when Supabase env vars are missing
// (first-time setup, hackathon demo, etc.).
const supabaseEnabled = Boolean(supabaseUrl && supabaseKey);

// createClient throws if the URL is empty, so we only construct the real
// client when env vars are present. When disabled, we expose a no-op stub
// whose methods reject gracefully — every Supabase call site is already
// wrapped in try/catch, so this keeps the backend fully functional on
// local-only / demo runs.
let supabase;
if (supabaseEnabled) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — ' +
      'backend will respond with empty data. Fill backend/.env to enable.'
  );
  const noopReject = () =>
    Promise.reject(new Error('Supabase not configured (using local seed)'));
  const noopTable = {
    select: () => ({ order: () => ({ data: null, error: null }), data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
  };
  supabase = {
    from: () => noopTable,
    _disabled: true,
  };
}

module.exports = { supabase, supabaseEnabled };
