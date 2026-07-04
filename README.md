<div align="center">

# ⚡ OfficePulse
### Smart Office Power Monitoring System

<br>

![React](https://img.shields.io/badge/React_18-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Node](https://img.shields.io/badge/Node.js_18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io_4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js_14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

<br>

![Live Demo](https://img.shields.io/badge/live_demo-static_%2B_zero_backend-22c55e?style=flat-square)
![Devices](https://img.shields.io/badge/devices-15_%286_fans_%2F_9_lights%29-3b82f6?style=flat-square)
![Max Load](https://img.shields.io/badge/max_load-495W-f59e0b?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

<sub>Built for **Techathon Nationals & Rover Summit** · IUT Robotics Society × Okkhor Technology</sub>

<br>

**[🚀 Live Demo](https://openoffice.netlify.app/)**

</div>

<br>

> **TL;DR** — A live dashboard + Discord bot that monitor 15 office devices (fans & lights) across 3 rooms, flag wasted energy, and never go down. The deployed demo runs a client-side simulation for 100% uptime reliability; the full Express + Socket.io + Supabase + Discord backend is included, working, and one `fly deploy` away from going live for real.

<br>

---

## 📑 Table of Contents

- [🧩 The Problem](#-the-problem)
- [✅ The Solution](#-the-solution)
- [✨ Features](#-features)
- [🧱 Tech Stack](#-tech-stack)
- [🏛️ Architecture — Two Modes, One UI](#️-architecture--two-modes-one-ui)
- [🧠 Key Engineering Decisions](#-key-engineering-decisions)
- [🚀 Quick Start](#-quick-start)
- [🔌 API Reference](#-api-reference)
- [🤖 Discord Bot](#-discord-bot-setup)
- [🔐 Environment Variables](#-environment-variables)
- [🔮 Future Improvements](#-future-improvements)

<br>

---

## 🧩 The Problem

Small offices waste real electricity because nobody can see it happening:

- Lights left ON overnight or over the weekend
- Fans running for hours in empty rooms
- No dashboard answering *"how much power are we drawing right now?"*
- No alerting when devices run outside office hours

What you can't see, you can't fix.

<br>

## ✅ The Solution

<table>
<tr>
<td width="50%" valign="top">

#### 🗺️ Live Visibility
A real-time top-view floor map of all **15 devices** across 3 rooms — fans spin, lights glow, everything updates without a page refresh.

</td>
<td width="50%" valign="top">

#### 🚨 Smart Alerts
Automatic detection of devices ON outside office hours, running 2+ hours continuously, or a room silently drawing 120W+.

</td>
</tr>
<tr>
<td width="50%" valign="top">

#### 🤖 Discord Remote Control
`!status`, `!room`, `!usage`, `!alerts` — check the whole office from any channel, no browser needed.

</td>
<td width="50%" valign="top">

#### 🛡️ Never Goes Down
The deployed demo needs no backend, no database, no API keys — it can't 500, sleep, or hit a CORS wall during judging.

</td>
</tr>
</table>

<br>

---

## ✨ Features

- 🟢 Real-time device ON/OFF updates — Socket.io in full-stack mode, `setInterval` in static demo mode, **identical UI either way**
- 🗺️ Interactive floor map — click any device marker to toggle it
- 📊 KPI dashboard — active devices, current watts, max possible watts (495W), load %, fans/lights ON
- 📈 Office-wide + per-room usage bars
- 🚨 Color-coded alerts (LOW / MEDIUM / HIGH severity)
- 🤖 Full Discord bot: `!status` `!room <name>` `!usage` `!alerts`
- 🛡️ Backend degrades gracefully — keeps working with no Supabase, no Discord token, or both
- 📱 Fully responsive, mobile + desktop
- ⚡ 15-device, 495W-max spec (2 fans + 3 lights per room — no ACs, corrected from the original problem statement's internal math error)

<br>

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Vite 5 · Tailwind CSS 3 |
| **Backend** | Node.js 18+ · Express 4 · Socket.io 4 · Discord.js 14 |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Frontend → Vercel/Netlify (static) · Backend → Fly.io · DB → Supabase |

<details>
<summary><b>🤔 Why Fly.io and not Replit / Railway / Render?</b></summary>

<br>

This wasn't an arbitrary pick — it came from hitting real walls with each option:

- **Replit** — deployments are usage-based with **no default spending cap**. A 24/7 Socket.io + Discord bot connection is exactly the workload multiple users have reported **$300–500+/month surprise bills** for.
- **Railway** — WebSockets work fine, but there's no permanent free tier anymore, only burnable trial credit.
- **Render** — genuinely free, no card required, but free web services **sleep after ~15 min idle**, dropping the Socket.io connection and taking the Discord bot offline until the next request wakes it.
- **Fly.io** ✅ — a real, current free allowance (3 shared-cpu VMs), native WebSocket support, no sleep. Requires a card for identity verification, but stays free within the allowance. `Dockerfile` + `fly.toml` are included, ready to deploy.

</details>

<br>

---

## 🏛️ Architecture — Two Modes, One UI

The same React components render identically in both modes — only the data source underneath changes.

<table>
<tr>
<th width="50%">🟢 Static Demo Mode <sub>(currently live)</sub></th>
<th width="50%">🔵 Full-Stack Mode <sub>(backend/, fully working)</sub></th>
</tr>
<tr>
<td valign="top">

```
mockData.js
(browser, setInterval 5s)
      ↓
mockApiClient.js +
mockSocketClient.js
      ↓
Dashboard.jsx
(unchanged)
      ↓
Header · PowerSummary ·
OfficeLayout · DeviceMarker ·
RoomPanel · DeviceCard ·
AlertsPanel
```

Zero network calls. Zero env vars. Can't fail during judging.

</td>
<td valign="top">

```
Simulated Devices
      ↓
Backend Simulator (15s tick)
      ↓
Supabase PostgreSQL
      ↓
Express API + Socket.io
      ↓
Web Dashboard   Discord Bot
      ↓              ↓
    User / Admin
```

Real persistence, real bot, deployable to Fly.io in ~5 minutes.

</td>
</tr>
</table>

Switching between them is a **2-line import change** in `Dashboard.jsx` — see [`docs/architecture.md`](docs/architecture.md) for the full diagram and the exact revert steps.

<br>

---

## 🧠 Key Engineering Decisions

<details>
<summary><b>⚖️ Resolving the spec's own math error: 15 devices, no AC</b></summary>

<br>

The original problem statement says *"2 fans and 3 lights (so 6 devices per room, 18 devices total)"* — but 2+3=5, not 6. Two valid readings exist: add an AC to reach 6/room, or treat "18" as the typo. We went with the **15-device reading** (no AC) per explicit correction — every seed, calculation, and doc reflects this consistently. Max load: 3 rooms × (2×60W + 3×15W) = **495W**.

</details>

<details>
<summary><b>🐛 Three real bugs found by actually running the code, not just reading it</b></summary>

<br>

| Bug | Root cause | Impact |
|---|---|---|
| `device_events` never populated | `new_status` referenced an undefined variable instead of the `newStatus` parameter | Every Supabase audit-log insert silently threw and failed |
| Discord bot said "no devices" without Supabase | `discordService.js` returned `[]` immediately instead of falling back to the shared in-memory store | Violated the "one source of truth" requirement — bot and dashboard disagreed |
| Fans never visually spun | Custom CSS referenced `animation: spin-fan` / `pulse-soft`, but those `@keyframes` only existed under Tailwind's internal names (`spin360`/`pulseGlow`) | The bonus-points animation was coded but invisible |

All three were caught by booting the real server and hitting every endpoint, not by reading the code and assuming it worked.

</details>

<details>
<summary><b>🎭 Why the live demo is static, and why that's a feature, not a shortcut</b></summary>

<br>

After repeated free-tier deployment failures (Render sleep cycles, Replit billing risk), the frontend was rearchitected so `mockData.js` reproduces the **exact same** device seed, wattage math, and alert rules as the real backend — just running with `setInterval` in the browser. Room-level wattages always sum to the exact total shown (e.g. 90+90+165=345W); there's no fake random jitter that could ever visibly disagree with itself under a judge's scrutiny. The full backend remains untouched in `backend/` for local demos, the Discord bot, and future redeployment.

</details>

<br>

---

## 🚀 Quick Start

### Static demo (what's deployed — no setup needed)

```bash
cd frontend
npm install
npm run build   # or npm run dev for local preview
```

No environment variables. No backend. Deploys to Vercel/Netlify as-is.

<details>
<summary><b>🔧 Full-stack mode — run the real backend + Discord bot locally</b></summary>

<br>

**1. Supabase**
```bash
# In the Supabase SQL Editor, run in order:
supabase/schema.sql
supabase/seed.sql        # seeds all 15 devices
```

**2. Backend**
```bash
cd backend
cp .env.example .env     # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DISCORD_TOKEN
npm install
npm start                # → http://localhost:5000
```

**3. Point the frontend at it** (see `docs/architecture.md` for the exact 2-line revert in `Dashboard.jsx`), then:

```bash
cd frontend
npm install
npm run dev               # → http://localhost:5173
```

**4. Deploy the backend for real** (Fly.io, free):
```bash
curl -L https://fly.io/install.sh | sh
fly auth signup
cd backend
fly launch --no-deploy    # detects fly.toml — say no to Postgres/Redis
fly secrets set \
  SUPABASE_URL=https://your-project.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  DISCORD_TOKEN=your-bot-token \
  FRONTEND_ORIGIN=https://your-frontend.vercel.app
fly deploy
```

</details>

<br>

---

## 🔌 API Reference

<sub>Full request/response examples in <a href="docs/api-documentation.md">docs/api-documentation.md</a></sub>

| Method | Endpoint | Description |
|:---:|---|---|
| `GET` | `/health` | Backend health + config status |
| `GET` | `/api/devices` | All 15 devices (live snapshot) |
| `GET` | `/api/devices/:id` | Single device |
| `PATCH` | `/api/devices/:id/toggle` | Manually toggle a device |
| `GET` | `/api/usage` | Total + room-wise power usage |
| `GET` | `/api/alerts` | Current alerts |
| `GET` | `/api/rooms/:roomName` | Devices + usage for one room |

<br>

---

## 🤖 Discord Bot Setup

<sub>Requires full-stack mode — the bot lives in <code>backend/discord/bot.js</code></sub>

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → name it `OfficePulse`
2. **Bot** tab → **Add Bot** → copy the token → this is `DISCORD_TOKEN`
3. Under **Privileged Gateway Intents**, enable **MESSAGE CONTENT INTENT**
4. **OAuth2 → URL Builder** → scope `bot`, permissions `Send Messages` + `Read Message History` → open the generated URL to invite it
5. Set `DISCORD_TOKEN` on whichever host runs the backend, restart, confirm `[discord] Bot online as ...` in the logs
6. Try `!status` in any channel the bot can read

> The backend never crashes if this token is missing — the bot is entirely optional.

<br>

---

## 🔐 Environment Variables

<table>
<tr><th>Backend (<code>backend/.env</code>)</th><th>Frontend (<code>frontend/.env</code>)</th></tr>
<tr>
<td valign="top">

| Key | Description |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret |
| `DISCORD_TOKEN` | Bot token *(optional)* |
| `PORT` | Default `5000` |
| `FRONTEND_ORIGIN` | For CORS |

</td>
<td valign="top">

**None required** for the current static demo build.

Only needed if reverted to full-stack mode:

| Key | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend REST URL |
| `VITE_SOCKET_URL` | Socket.io URL |

</td>
</tr>
</table>

<br>

---

## 🔮 Future Improvements

- [ ] Plug in real IoT sensors (ESP32 + relay modules) in place of the simulator
- [ ] Historical usage charts (24h / 7d) from `device_events`
- [ ] Slack / Microsoft Teams bot alongside Discord
- [ ] Schedule-based rules — auto-OFF everything at 7 PM
- [ ] User auth + role-based access (admin vs viewer)
- [ ] Cost estimator — kWh × local tariff
- [ ] Multi-floor / multi-building support

<br>

---

<div align="center">

### Built with a real backend, a real bug list, and a live demo that can't go down.

<sub>MIT License · Built for hackathon fun</sub>

<br>

![Made with care](https://img.shields.io/badge/Made_with-React_+_Node.js-22c55e?style=for-the-badge)

</div>
