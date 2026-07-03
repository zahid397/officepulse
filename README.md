# OfficePulse — Smart Office Power Monitoring System

> Real-time office power monitoring for **15 devices** (2 fans + 3 lights per room × 3 rooms) with a live web dashboard, automatic device simulator, smart alerts, and a Discord bot — built for hackathons.

---

## 📌 Project Overview

**OfficePulse** is a smart office power monitoring system that tracks the ON/OFF
status and power consumption of **fans and lights** across three office rooms.
A backend simulator continuously toggles devices, all state is persisted to
Supabase, and updates are pushed to a real-time web dashboard over Socket.io.
A Discord bot lets admins query status, per-room usage, total energy, and
active alerts from any channel.

> **Corrected device count (problem statement v1.2):** the office has exactly
> **15 devices** — 3 rooms × (2 fans + 3 lights). There are **no AC units**.
> Maximum possible power draw is **495 W** (165 W per room × 3 rooms).

The system was designed as a hackathon-ready project: it works out of the box
with a local seed dataset, degrades gracefully when Supabase or Discord are
unavailable, and ships with a clean dark dashboard, demo script, and full
documentation.

---

## 🧩 Problem Statement

Small and medium offices waste significant electricity because there is **no
real-time visibility** into which devices are running, when, and for how long.
Common scenarios:

- Lights left ON overnight or over the weekend.
- Fans running for hours in empty meeting rooms.
- No single dashboard to answer "how much power is the office drawing right
  now?".
- No alerting when devices run outside office hours.

Without monitoring, energy waste is invisible — and what you cannot see, you
cannot fix.

---

## ✅ Solution

OfficePulse provides:

1. **Live monitoring** of all 15 office devices (fans + lights) on a single
   dark dashboard.
2. **Automatic simulation** of device activity every 15 seconds (real hardware
   can be plugged in later — the API surface is identical).
3. **Smart alerts** for:
   - Devices ON outside office hours (9 AM – 5 PM, weekdays).
   - Devices ON for more than 2 hours continuously.
   - Rooms drawing more than 120 W simultaneously (possible unnecessary usage).
4. **Discord bot** for admins to check status, per-room usage, total energy,
   and alerts from anywhere.
5. **Supabase persistence** so historical events are queryable later.

---

## 🚀 Features

- 🟢 Real-time device ON/OFF updates over Socket.io (no page refresh).
- 🗺️ Interactive office floor map with all 15 devices — fans spin when ON,
  lights glow yellow when ON, both gray out when OFF.
- 📊 KPI dashboard: active devices out of 15, current watts, max possible
  watts (495 W), load %, fans/lights ON counts.
- 📈 Office-wide load bar + per-room usage bars.
- 🚨 Color-coded alerts panel (LOW / MEDIUM / HIGH severity).
- 🤖 Discord bot commands: `!status`, `!room`, `!usage`, `!alerts`, `!help`.
- 🔌 Click any device marker to manually toggle it (writes back to Supabase).
- 🛡️ Graceful degradation: backend keeps working even if Supabase is empty or
  Discord token is missing.
- 📱 Responsive layout (mobile + desktop).
- ⚡ Hackathon demo-friendly: simulator ticks every 15 seconds so the dashboard
  is always alive.

---

## 🧱 Tech Stack

| Layer       | Tech                                                |
| ----------- | --------------------------------------------------- |
| Frontend    | React 18, Vite 5, Tailwind CSS 3, Axios, Socket.io-client |
| Backend     | Node.js 18+, Express 4, Socket.io 4, Discord.js 14  |
| Database    | Supabase (PostgreSQL)                               |
| Deployment  | Frontend → Vercel/Netlify, Backend → Fly.io (free), DB → Supabase |

**Not used (deliberately):** Replit deployments — as of 2026 Replit billing is
usage-based with no default spending cap, and a 24/7 Socket.io + Discord bot
process is exactly the profile users have reported $300–500+/month surprise
charges for. Render/Railway free tiers either sleep (Render) or run on
burnable trial credit, not a permanent free tier (Railway). Fly.io's free
allowance (3 shared-cpu VMs) is the best current fit for a process that must
stay alive for Socket.io + the Discord bot — see the Backend Deployment
section below for exact steps, plus a Render fallback if you'd rather not
add a card.

---

## 🏛️ Architecture

```
Simulated Devices (15 fans/lights)
      ↓
Backend Simulator (15s tick)
      ↓
Supabase PostgreSQL  ←──┐
      ↓                 │
Express API + Socket.io │ (discordService reads from DB)
      ↓                 │
Web Dashboard       Discord Bot
      ↓                 ↓
   User / Admin
```

- The simulator writes status changes to Supabase and emits three Socket.io
  events: `devices:update`, `usage:update`, `alerts:update`.
- The web dashboard subscribes to those events and re-renders without a page
  refresh.
- The Discord bot reads from Supabase on demand (no Socket.io needed).
- See `docs/architecture.md` for the full diagram.

---

## 📁 Folder Structure

```
officepulse/
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── socket.js
│   ├── .env.example
│   ├── config/supabase.js
│   ├── data/seedDevices.js
│   ├── routes/{deviceRoutes,usageRoutes,alertRoutes}.js
│   ├── services/{simulatorService,powerService,alertService,discordService}.js
│   ├── utils/{timeUtils,formatters}.js
│   └── discord/bot.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.jsx, App.jsx
│       ├── api/apiClient.js
│       ├── socket/socketClient.js
│       ├── pages/Dashboard.jsx
│       ├── components/{Header,OfficeLayout,DeviceMarker,RoomPanel,
│       │               DeviceCard,PowerSummary,AlertsPanel}.jsx
│       ├── utils/{deviceHelpers,powerHelpers}.js
│       └── styles/index.css
├── supabase/{schema.sql,seed.sql}
├── docs/{architecture,api-documentation,discord-bot-commands,
│         demo-script,submission-checklist}.md
└── diagrams/README.md
```

---

## 🗄️ Supabase Setup

1. Create a project at <https://supabase.com>.
2. Open the **SQL Editor** and run `supabase/schema.sql`.
3. Then run `supabase/seed.sql` to populate the **15 devices** (3 rooms × 5).
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`
   (⚠️ Never expose the service_role key in the frontend.)
5. Verify: `SELECT count(*) FROM devices;` should return **15**.

---

## 🖥️ Backend — Local & Free Deployment

The backend cannot be serverless: Socket.io and the Discord bot both need
one process that stays alive and holds open connections. Vercel/Netlify
functions are request-scoped and will not work for this piece — only the
frontend goes there.

### Local

```bash
cd backend
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DISCORD_TOKEN, FRONTEND_ORIGIN
npm install
npm start
# Server runs on http://localhost:5000
```

### Option A — Fly.io (recommended, genuinely free)

Fly.io's free allowance (3 shared-cpu-1x-256mb VMs) covers this backend with
room to spare, and it keeps a real persistent connection alive for Socket.io
and the Discord bot — no sleep, no cold starts. A `Dockerfile` and `fly.toml`
are already included.

```bash
brew install flyctl        # or: curl -L https://fly.io/install.sh | sh
fly auth signup             # or `fly auth login` if you already have an account
cd backend
fly launch --no-deploy      # detects fly.toml — say NO to adding Postgres/Redis
fly secrets set \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  DISCORD_TOKEN=your-bot-token \
  FRONTEND_ORIGIN=https://your-frontend.vercel.app
fly deploy
```

Your backend is now live at `https://officepulse-backend.fly.dev` (or
whatever name you chose). Health check:
`https://officepulse-backend.fly.dev/health`.

> **Honest caveat:** Fly.io asks for a card on signup for identity
> verification. Staying inside the free allowance (1 machine, this app's
> size) means you should not be charged, but set a spending alert in the
> Fly dashboard if that matters to you.

### Option B — Render (no card required, but sleeps when idle)

Render's free web services are genuinely free with no card, but they spin
down after ~15 minutes of no traffic and take 30–60s to wake back up — which
means the Socket.io connection drops and the Discord bot goes offline while
asleep. A `render.yaml` is included for a one-click Blueprint deploy.

```bash
# Push to GitHub, then in Render: New → Blueprint → select your repo
# Add the same env vars as above (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
# DISCORD_TOKEN, FRONTEND_ORIGIN) in the Render dashboard
```

**Keep-alive workaround for a demo/judging window:** point a free uptime
pinger (e.g. UptimeRobot or cron-job.org, both free) at
`https://your-app.onrender.com/health` every 5–10 minutes. This keeps the
service — and the Discord bot's connection — awake for as long as the
pinger runs, at zero cost.

### Why not Replit / Railway?

- **Replit**: deployments moved to usage-based billing with no default cap.
  A 24/7 Socket.io + Discord bot is precisely the workload multiple users
  have reported $300–500+/month bills for. Fine for local editing, risky to
  deploy long-running here.
- **Railway**: WebSockets work on every plan, but there is no permanent free
  tier anymore — you run on trial credit that eventually runs out.

---

## 🎨 Frontend — Local & Vercel/Netlify Deployment

### Local

```bash
cd frontend
cp .env.example .env
# Fill VITE_API_BASE_URL and VITE_SOCKET_URL with your backend URL
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

### Vercel

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Set:
   - **Root Directory** → `frontend`
   - **Build Command** → `npm run build`
   - **Output Directory** → `dist`
   - **Environment Variables**:
     - `VITE_API_BASE_URL` → `https://officepulse-backend.fly.dev` (or your Render URL)
     - `VITE_SOCKET_URL` → same URL as above
4. Deploy. Vercel gives you a `https://officepulse.vercel.app` style URL.

### Netlify

1. Push repo to GitHub.
2. In Netlify → **Add new site → Import from Git**.
3. Set:
   - **Base directory** → `frontend`
   - **Build command** → `npm run build`
   - **Publish directory** → `frontend/dist`
   - **Environment variables** → same as Vercel above.
4. Deploy.

---

## 🤖 Discord Bot Setup

1. Go to the <https://discord.com/developers/applications> page.
2. **New Application** → name it `OfficePulse`.
3. **Bot** tab → **Add Bot** → copy the **Token** (this is `DISCORD_TOKEN`).
4. Under **Privileged Gateway Intents**, enable:
   - **MESSAGE CONTENT INTENT**
   - **SERVER MEMBERS INTENT** (optional)
5. **OAuth2 → URL Builder** → select scopes `bot` + permissions `Send Messages`
   + `Read Message History`. Open the generated URL to invite the bot to your
   server.
6. Add `DISCORD_TOKEN` as a secret on whichever host runs the backend
   (`fly secrets set DISCORD_TOKEN=...` for Fly.io, the Render dashboard's
   env vars for Render, or your local `backend/.env`).
7. Restart the backend — you should see `[discord] Bot online as ...`.
8. In any channel the bot can read, type `!status`.

**The backend stays alive even if the Discord token is missing** — the bot is
optional.

---

## 🔌 API Endpoints

See `docs/api-documentation.md` for full request/response examples.

| Method | Endpoint                       | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| GET    | `/health`                      | Backend health + config status           |
| GET    | `/api/devices`                 | All 15 devices (live snapshot)           |
| GET    | `/api/devices/:id`             | Single device                            |
| PATCH  | `/api/devices/:id/toggle`      | Manually toggle a device                 |
| GET    | `/api/usage`                   | Total + room-wise usage                  |
| GET    | `/api/alerts`                  | Current alerts                           |
| GET    | `/api/rooms/:roomName`         | Devices + usage for a single room        |

---

## 🧪 Demo Instructions

1. Open the frontend URL (Vercel/Netlify).
2. Watch the office floor map — all 15 devices update every 15s (fans spin,
   lights glow).
3. Click any device marker to manually toggle it.
4. Watch the alerts panel populate when devices run too long or outside office
   hours.
5. From Discord, run `!status`, `!room drawing`, `!usage`, `!alerts`.
6. See `docs/demo-script.md` for a 3-minute demo video script.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Key                       | Description                              |
| ------------------------- | ---------------------------------------- |
| `SUPABASE_URL`            | Supabase project URL                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (server-only) |
| `DISCORD_TOKEN`           | Discord bot token (optional)             |
| `PORT`                    | Backend port (default 5000)              |
| `FRONTEND_ORIGIN`         | Frontend URL for CORS                    |

### Frontend (`frontend/.env`)

| Key                  | Description             |
| -------------------- | ----------------------- |
| `VITE_API_BASE_URL`  | Backend REST base URL   |
| `VITE_SOCKET_URL`    | Socket.io server URL    |

---

## 🔮 Future Improvements

- Plug in **real IoT sensors** (ESP32 + relay modules) instead of the simulator.
- Add **AC units** in a future iteration (current scope is fans + lights only).
- **Historical charts** (last 24h / 7d energy usage) using `device_events`.
- **Slack / Microsoft Teams** bot in addition to Discord.
- **Schedule-based rules**: auto-OFF everything at 7 PM.
- **User auth** + role-based access (admin vs viewer).
- **Mobile push notifications** for HIGH severity alerts.
- **Cost estimator**: multiply kWh by local tariff.
- **Multi-floor / multi-building** support.

---

## 📚 Documentation Index

- `docs/architecture.md` — system architecture + diagram
- `docs/api-documentation.md` — REST API reference with example responses
- `docs/discord-bot-commands.md` — Discord bot command reference
- `docs/demo-script.md` — 3-minute demo video script
- `docs/submission-checklist.md` — pre-submission checklist

---

## 📜 License

MIT — free to use, modify, and demo. Built for hackathon fun.
#   o f f i c e p u l s e  
 #   o f f i c e p u l s e  
 