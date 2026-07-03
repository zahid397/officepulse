# Architecture

## High-Level Flow

```
Simulated Devices (15 fans/lights)
      ↓
Backend Simulator
      ↓
Supabase PostgreSQL
      ↓
Express API + Socket.io
      ↓
Web Dashboard + Discord Bot
      ↓
User / Admin
```

## Office Layout (problem statement v1.2)

- **3 rooms** side by side: Drawing Room, Work Room 1, Work Room 2.
- Each room has exactly **5 devices**: 2 fans (60 W each) + 3 lights (15 W each).
- **15 devices total** across the office (no AC units).
- Per-room max power = **165 W**.
- Office max power = **495 W** (165 × 3).

## Component Breakdown

### 1. Simulator (`backend/services/simulatorService.js`)
- Runs every **15 seconds** on a `setInterval`.
- Picks **1–3 random devices** (out of the 15) and toggles their status.
- Writes the new status to the `devices` table.
- Inserts a row into `device_events` (old_status, new_status, changed_at).
- Broadcasts `devices:update`, `usage:update`, `alerts:update` over Socket.io.
- Keeps an **in-memory cache** of devices so the dashboard never goes stale
  even if Supabase temporarily fails.

### 2. Power Service (`backend/services/powerService.js`)
- Pure function: takes a device list, returns:
  - total / active / inactive counts (out of 15)
  - total current watts
  - max possible watts (**495 W**)
  - load percentage (current / max)
  - average watts per active device
  - fan / light ON counts
  - per-room summary (`{ total, active, watts }`)

### 3. Alert Service (`backend/services/alertService.js`)
- Pure function: takes a device list, returns alerts.
- Rules:
  - **OFFICE_HOURS** — any ON device outside 9 AM–5 PM weekdays
  - **LONG_RUNNING** — any ON device whose `last_changed` is older than 2 hours
  - **HIGH_USAGE** — any room drawing more than 120 W simultaneously
    (e.g. both fans running, or 1 fan + all 3 lights, etc.)
- Severity escalates (LONG_RUNNING > 4h becomes HIGH; HIGH_USAGE ≥ 150 W becomes HIGH).

### 4. Express API (`backend/server.js` + `backend/routes/*`)
- Stateless REST endpoints (see `api-documentation.md`).
- Mounted routes:
  - `/api/devices` → `deviceRoutes.js`
  - `/api` (for `/usage` + `/rooms/:roomName`) → `usageRoutes.js`
  - `/api/alerts` → `alertRoutes.js`
- All endpoints fall back to the in-memory device list if Supabase is empty.

### 5. Socket.io (`backend/socket.js`)
- Single `Server` instance attached to the Express HTTP server.
- Emits three events to all connected clients:
  - `devices:update` — full device list (15 entries)
  - `usage:update` — usage object
  - `alerts:update` — alert array
- Accepts `ping` from clients (lightweight liveness check).

### 6. Discord Bot (`backend/discord/bot.js` + `services/discordService.js`)
- discord.js v14, MessageContent intent.
- Reads from Supabase on each command — no caching, always fresh.
- Commands: `!status`, `!room <name>`, `!usage`, `!alerts`, `!help`.
- `!status` uses a conversational per-room summary like:
  `Drawing Room: 1 fan ON, 2 lights ON.`
- Defensive: any error is caught and converted to a friendly Discord reply.

### 7. Frontend (`frontend/src/`)
- React 18 + Vite + Tailwind CSS.
- `Dashboard.jsx` is the single-page orchestrator:
  - Initial REST load on mount (`fetchDevices`, `fetchUsage`, `fetchAlerts`).
  - Subscribes to three Socket.io events and updates local state.
  - Manual toggle uses optimistic update + REST PATCH.
- Components:
  - `Header` — sticky top bar with live + health + clock.
  - `PowerSummary` — KPI tiles + office-wide load bar + room-wise bars.
  - `OfficeLayout` — floor map with 3 rooms side by side and absolute-positioned
    `DeviceMarker`s.
  - `DeviceMarker` — per-type visual (fan spin / light glow).
  - `RoomPanel` + `DeviceCard` — grouped device cards.
  - `AlertsPanel` — color-coded alert list.

## Data Model

### `devices` table
| column        | type         | notes                                   |
| ------------- | ------------ | --------------------------------------- |
| id            | text (PK)    | e.g. `drawing-fan-1`                    |
| room_name     | text         | `Drawing Room`, `Work Room 1`, `Work Room 2` |
| device_name   | text         | `Drawing Fan 1`                         |
| device_type   | text         | `fan` or `light` (NO AC)                |
| status        | text         | `ON` or `OFF`                           |
| power_draw    | integer      | watts: fan 60, light 15                 |
| last_changed  | timestamptz  | when status last changed                |
| x_position    | integer      | 0–100 percentage on the floor map       |
| y_position    | integer      | 0–100 percentage on the floor map       |
| created_at    | timestamptz  | row creation time                       |

### `device_events` table
| column      | type         | notes                            |
| ----------- | ------------ | -------------------------------- |
| id          | uuid (PK)    | auto `gen_random_uuid()`         |
| device_id   | text (FK)    | references `devices(id)`         |
| old_status  | text         | previous status                  |
| new_status  | text         | new status                       |
| changed_at  | timestamptz  | when the event occurred          |

## Power Math

- Fan = 60 W, Light = 15 W.
- Per room (max) = 2 × 60 + 3 × 15 = 120 + 45 = **165 W**.
- Office (max) = 3 × 165 = **495 W**.
- HIGH_USAGE alert triggers when a single room draws more than **120 W**
  simultaneously (so any time both fans are ON, or 1 fan + all 3 lights).

## Security Posture
- The **service role key** is only ever imported in `backend/config/supabase.js`.
- The frontend never imports Supabase directly — it only calls the Express API.
- `.env` files are in `.gitignore`; only `.env.example` is committed.
- RLS is enabled on both tables with read-only public access and write-only
  service-role access.

## Resilience
- Missing `DISCORD_TOKEN` → bot disabled, server still starts.
- Missing/empty Supabase → backend uses local `SEED_DEVICES` for the dashboard.
- Supabase query error mid-tick → error is logged, in-memory state remains
  consistent, next tick retries.
- Frontend socket disconnect → reconnects automatically with backoff.
