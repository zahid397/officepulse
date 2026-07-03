# OfficePulse — Diagrams

This folder holds visual diagrams for the project. For a hackathon submission,
the most important diagrams are:

1. **Architecture diagram** — see `docs/architecture.md` for the ASCII version.
2. **Office floor map** — rendered live in the web dashboard (see
   `frontend/src/components/OfficeLayout.jsx`).
3. **Circuit schematic** — only required if you wire up real ESP32 relays
   instead of using the simulator.

> **Problem statement v1.2:** the office has exactly **15 devices** (3 rooms ×
> 5 devices: 2 fans + 3 lights). No AC units. Max office power = **495 W**.

---

## Architecture (text)

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

---

## Office Floor Map (text) — 3 rooms side by side

```
┌──────────────────────────────────────────────────────────────────┐
│                      OFFICE FLOOR MAP · 15 DEVICES               │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  │  DRAWING ROOM      │  │  WORK ROOM 1       │  │  WORK ROOM 2       │
│  │                    │  │                    │  │                    │
│  │   🌀    🌀          │  │   🌀    🌀          │  │   🌀    🌀          │
│  │   (fan) (fan)      │  │   (fan) (fan)      │  │   (fan) (fan)      │
│  │                    │  │                    │  │                    │
│  │   💡   💡   💡       │  │   💡   💡   💡       │  │   💡   💡   💡       │
│  │  (lt) (lt) (lt)    │  │  (lt) (lt) (lt)    │  │  (lt) (lt) (lt)    │
│  │                    │  │                    │  │                    │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

Legend:
  🌀  Fan     (60 W)  — spins when ON, gray when OFF
  💡  Light   (15 W)  — glows yellow when ON, gray when OFF

Per-room max = 165 W (2×60 + 3×15)
Office max   = 495 W (3 × 165)
```

---

## Circuit Schematic (simulator-only build)

This hackathon build uses a software simulator instead of real hardware, so
there is no physical circuit. If you upgrade to real IoT devices later, the
recommended setup is:

```
ESP32 ── GPIO ── Relay Module ── AC Mains ── Device (Fan / Light)
  │
  └── Wi-Fi ── HTTP PATCH /api/devices/:id/toggle ── Backend ── Supabase
```

Components per room (5 devices):
- 1× ESP32 (or ESP8266)
- 5× single-channel 5 V relay modules (one per device)
- 5× ACS712 current sensors (optional, for real power measurement)
- 1× 5 V USB power supply for the ESP32
- 1× 5 V USB power supply for the relays

Replace the simulator with a small firmware loop that:
1. Polls `/api/devices/:id` every 5 seconds for the latest desired state.
2. Drives the relay GPIO to match.
3. Posts an event to `/api/devices/:id/toggle` when the user changes state
   from the dashboard.

The REST + Socket.io + Supabase + Discord architecture stays exactly the same —
only the simulator is swapped out.
